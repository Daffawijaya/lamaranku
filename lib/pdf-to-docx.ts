import { DOMParser, type Element } from "@xmldom/xmldom";
import { flowPage, type FlowGraphic } from "./cv-flow";
import { deflateSync, inflateSync } from "node:zlib";
import { strToU8, strFromU8, unzipSync, zipSync } from "fflate";
import { MAX_REPAIR_BYTES, pdfium } from "./pdf-repair";
import { pdfReadingOrder, type PdfBlock, type PdfCharacter } from "./pdf-layout";
import { openRepairDocx } from "./docx-repair";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function pngChunk(type: string, bytes: Uint8Array) {
  const chunk = Buffer.alloc(bytes.length + 12);
  chunk.writeUInt32BE(bytes.length, 0); chunk.write(type, 4); chunk.set(bytes, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, -4)) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4);
  return chunk;
}
function backgroundPng(bgra: Uint8Array, width: number, height: number, stride: number) {
  const rows = Buffer.alloc(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1);
    for (let x = 0; x < width; x++) {
      const source = y * stride + x * 4, target = row + 1 + x * 3;
      rows[target] = bgra[source + 2]; rows[target + 1] = bgra[source + 1]; rows[target + 2] = bgra[source];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk("IHDR", header), pngChunk("IDAT", deflateSync(rows)), pngChunk("IEND", new Uint8Array())]);
}

function extractFlowGraphics(pixels: Uint8Array, pixelWidth: number, pixelHeight: number, stride: number, scale: number, p: number, files: Record<string, Uint8Array>, relationships: string[]) {
  const graphics: FlowGraphic[] = [];
  // Crop only non-text graphics. Full-page backgrounds would pin old geometry.
  const bands: { top: number; bottom: number; left: number; right: number }[] = [];
  for (let y = 0; y < pixelHeight; y++) {
    let left = pixelWidth, right = -1;
    for (let x = 0; x < pixelWidth; x++) {
      const offset = y * stride + x * 4;
      if (Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]) < 220) { left = Math.min(left, x); right = x; }
    }
    if (right < 0) continue;
    const last = bands.at(-1);
    if (last && y - last.bottom <= 2) { last.bottom = y; last.left = Math.min(last.left, left); last.right = Math.max(last.right, right); }
    else bands.push({ top: y, bottom: y, left, right });
  }
  for (const [index, band] of bands.entries()) {
    const w = band.right - band.left + 1, h = band.bottom - band.top + 1;
    const id = p * 2000 + index + 1;
    const graphic: FlowGraphic = { top: band.top / scale, left: band.left / scale, width: w / scale, height: h / scale, id };
    if (h / scale <= 5 && w / scale > 50) {
      let offset = band.top * stride + Math.floor((band.left + band.right) / 2) * 4;
      for (let y = band.top; y <= band.bottom; y++) {
        const candidate = y * stride + Math.floor((band.left + band.right) / 2) * 4;
        if (pixels[candidate] + pixels[candidate + 1] + pixels[candidate + 2] < pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) offset = candidate;
      }
      graphic.color = [2, 1, 0].map(channel => pixels[offset + channel].toString(16).padStart(2, "0")).join("");
    } else {
      const cropped = new Uint8Array(w * h * 4);
      for (let y = 0; y < h; y++) cropped.set(pixels.subarray((band.top + y) * stride + band.left * 4, (band.top + y) * stride + (band.right + 1) * 4), y * w * 4);
      const image = backgroundPng(cropped, w, h, w * 4);

      files[`word/media/graphic${id}.png`] = image;
      graphic.relationship = `graphic${id}`;
      relationships.push(`<Relationship Id="graphic${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/graphic${id}.png"/>`);
    }
    graphics.push(graphic);
  }
  return graphics;
}

/** Upgrade only the fixed-position DOCX files produced by older versions of this app. */
export function normalizeConvertedCv(data: Uint8Array) {
  // Validate sizes, package contents and XML before inspecting a potentially uploaded archive.
  const validation = openRepairDocx(data); validation.close();
  const files = unzipSync(data);
  let source = strFromU8(files["word/document.xml"]);
  if (!source.includes('id="background1"') || !source.includes("urn:schemas-microsoft-com:vml")) return data;
  const parse = (text: string) => new DOMParser().parseFromString(text, "application/xml");
  const document = parse(source);
  const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const rects = Array.from(document.getElementsByTagNameNS("urn:schemas-microsoft-com:vml", "rect"));
  // Mixed Word documents may contain other authored content; never discard it during migration.
  if (rects.some(rect => !/^(?:background|text)\d+$/.test(rect.getAttribute("id") ?? ""))) return data;
  const bodyElement = document.getElementsByTagNameNS(word, "body")[0];
  for (const child of Array.from(bodyElement?.childNodes ?? [])) {
    if (child.nodeType !== 1) continue;
    const element = child as Element;
    if (element.localName === "sectPr") continue;
    if (element.localName !== "p" || element.getElementsByTagNameNS(word, "t").length && !element.getElementsByTagNameNS("urn:schemas-microsoft-com:vml", "rect").length) return data;
  }
  const relationshipsXml = strFromU8(files["word/_rels/document.xml.rels"]);
  const relationships = parse(relationshipsXml);
  const images = new Map(Array.from(relationships.getElementsByTagName("Relationship"), rel => [rel.getAttribute("Id"), rel.getAttribute("Target")]));
  const additions: string[] = [], body: string[] = [];
  let width = 595, height = 842;
  const measurement = (style: string, name: string) => Number(style.match(new RegExp(`(?:^|;)${name}:([\\d.]+)pt`))?.[1] ?? 0);
  let blocks: PdfBlock[] = [], graphics: FlowGraphic[] = [];
  const flush = () => { if (blocks.length) body.push(flowPage(blocks, graphics, width, height, 40)); blocks = []; graphics = []; };
  let page = -1;
  for (const rect of rects) {
    const id = rect.getAttribute("id") ?? "", style = rect.getAttribute("style") ?? "";
    if (/^background\d+$/.test(id)) {
      flush(); page++;
      if (page >= 50) throw new Error("Konversi mendukung dokumen 1–50 halaman.");
      width = measurement(style, "width"); height = measurement(style, "height");
      if (!width || !height) throw new Error("Ukuran DOCX lama tidak dapat dibaca. Unggah PDF sumbernya kembali.");
      const image = rect.getElementsByTagNameNS("urn:schemas-microsoft-com:vml", "imagedata")[0];
      const target = images.get(image?.getAttribute("r:id") ?? "");
      const png = target && files[`word/${target}`];
      if (!png) throw new Error("Gambar DOCX lama tidak lengkap. Unggah PDF sumbernya kembali.");
      const buffer = Buffer.from(png), w = buffer.readUInt32BE(16), h = buffer.readUInt32BE(20);
      if (!w || !h || w * h > 2_000_000 || buffer[24] !== 8 || buffer[25] !== 2) throw new Error("Gambar DOCX lama tidak didukung. Unggah PDF sumbernya kembali.");
      const chunks: Uint8Array[] = [];
      for (let offset = 8; offset + 12 <= buffer.length;) {
        const size = buffer.readUInt32BE(offset);
        if (offset + size + 12 > buffer.length) throw new Error("Gambar DOCX rusak.");
        if (buffer.toString("ascii", offset + 4, offset + 8) === "IDAT") chunks.push(buffer.subarray(offset + 8, offset + 8 + size));
        offset += size + 12;
      }
      const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: h * (w * 3 + 1) });
      if (raw.length !== h * (w * 3 + 1)) throw new Error("Gambar DOCX rusak.");
      const pixels = new Uint8Array(w * h * 4);
      for (let y = 0; y < h; y++) {
        if (raw[y * (w * 3 + 1)] !== 0) throw new Error("Gambar DOCX lama tidak didukung. Unggah PDF sumbernya kembali.");
        for (let x = 0; x < w; x++) {
          const from = y * (w * 3 + 1) + 1 + x * 3, to = (y * w + x) * 4;
          pixels[to] = raw[from + 2]; pixels[to + 1] = raw[from + 1]; pixels[to + 2] = raw[from]; pixels[to + 3] = 255;
        }
      }
      graphics = extractFlowGraphics(pixels, w, h, w * 4, w / width, page + 50, files, additions);
    } else if (/^text\d+$/.test(id)) {
      const paragraph = rect.getElementsByTagNameNS(word, "p")[0];
      if (!paragraph) continue;
      const value = (name: string, attribute = "val") => paragraph.getElementsByTagNameNS(word, name)[0]?.getAttribute(`w:${attribute}`) ?? "";
      const size = Number(value("sz")) / 2 || 11, top = measurement(style, "margin-top"), left = measurement(style, "margin-left");
      const text = Array.from(paragraph.getElementsByTagNameNS(word, "t"), node => node.textContent ?? "").join("");
      const paragraphStyle = value("pStyle");
      const center = value("jc") === "center";
      const boxWidth = measurement(style, "width"), boxHeight = measurement(style, "height");
      blocks.push({ id, text, kind: paragraphStyle === "Title" ? "title" : paragraphStyle === "Heading1" ? "heading" : "paragraph",
        layout: { left: center ? (width - boxWidth) / 2 : left, right: center ? (width + boxWidth) / 2 : left + boxWidth, top: height - top, bottom: height - top - boxHeight, baseline: height - top - size, size, bold: paragraph.getElementsByTagNameNS(word, "b").length > 0, font: value("rFonts", "ascii") || "Arial", color: value("color") || "202020", lineHeight: size * 1.2 } });
    }
  }
  flush();
  const section = `<w:sectPr><w:pgSz w:w="${Math.round(width * 20)}" w:h="${Math.round(height * 20)}"/><w:pgMar w:top="800" w:right="800" w:bottom="800" w:left="800" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`;
  source = source.replace(/<w:body>[\s\S]*<\/w:body>/, `<w:body>${body.join("")}${section}</w:body>`);
  source = source.replace("<w:document ", '<w:document xmlns:cvflow="urn:lamaranku:cv-flow:1" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" ');
  files["word/document.xml"] = strToU8(source);
  files["word/_rels/document.xml.rels"] = strToU8(relationshipsXml.replace("</Relationships>", `${additions.join("")}</Relationships>`));
  return zipSync(files);
}

/** Convert PDF content to native Word flow; Word handles wrapping and pagination. */
export async function convertPdfToDocx(data: Uint8Array, signal?: AbortSignal) {
  if (!data.length || data.length > MAX_REPAIR_BYTES || !Buffer.from(data.subarray(0, 1024)).includes(Buffer.from("%PDF-"))) throw new Error("Gunakan PDF maksimal 10 MB.");
  signal?.throwIfAborted();
  const m = await pdfium();
  const alloc = (size: number) => m.pdfium.wasmExports.malloc(size);
  const free = (ptr: number) => m.pdfium.wasmExports.free(ptr);
  const heap = () => (m.pdfium as typeof m.pdfium & { HEAPU8: Uint8Array }).HEAPU8;
  const source = alloc(data.length); heap().set(data, source);
  const doc = m.FPDF_LoadMemDocument(source, data.length, "");
  if (!doc) { free(source); throw new Error("PDF tidak dapat dibaca. Gunakan PDF tanpa kata sandi."); }
  const files: Record<string, Uint8Array> = {};
  const body: string[] = [], relationships: string[] = [];
  let totalChars = 0, totalBlocks = 0, totalBackgroundBytes = 0, totalObjects = 0;
  let pageWidth = 595, pageHeight = 842, margin = 40;
  try {
    const count = m.FPDF_GetPageCount(doc);
    if (count < 1 || count > 50) throw new Error("Konversi mendukung PDF 1–50 halaman.");
    if (m.FPDF_GetSignatureCount(doc)) throw new Error("Gunakan salinan CV tanpa tanda tangan digital.");
    for (let p = 0; p < count; p++) {
      signal?.throwIfAborted();
      const page = m.FPDF_LoadPage(doc, p);
      if (!page) throw new Error("Halaman PDF tidak dapat dibaca.");
      let textPage = 0;
      try {
        const width = m.FPDF_GetPageWidth(page), height = m.FPDF_GetPageHeight(page);
        const crop = alloc(16);
        let cropLeft = 0, cropBottom = 0;
        try {
          if (m.FPDFPage_GetCropBox(page, crop, crop + 4, crop + 8, crop + 12)) {
            cropLeft = m.pdfium.getValue(crop, "float"); cropBottom = m.pdfium.getValue(crop + 4, "float");
          }
        } finally { free(crop); }
        if (![width, height].every(value => Number.isFinite(value) && value > 0 && value <= 1584)) throw new Error("Ukuran halaman PDF belum didukung Word. Gunakan ukuran A4 atau Letter.");
        textPage = m.FPDFText_LoadPage(page);
        if (!textPage) throw new Error("Teks PDF tidak dapat dibaca.");
        const chars = m.FPDFText_CountChars(textPage);
        totalChars += Math.max(0, chars);
        if (totalChars > 80_000) throw new Error("Teks PDF terlalu panjang untuk perbaikan otomatis.");
        const positioned: PdfCharacter[] = [];
        const ptr = alloc(64);
        try {
          for (let index = 0; index < chars; index++) {
            const unicode = m.FPDFText_GetUnicode(textPage, index);
            const code = m.FPDFText_IsHyphen(textPage, index) === 1 ? 45 : unicode;
            if (code < 32 || code > 0x10ffff || code >= 0xd800 && code <= 0xdfff) continue;
            if (!m.FPDFText_GetCharBox(textPage, index, ptr, ptr + 8, ptr + 16, ptr + 24)
              || !m.FPDFText_GetCharOrigin(textPage, index, ptr + 32, ptr + 40)) continue;
            const left = m.pdfium.getValue(ptr, "double") - cropLeft, right = m.pdfium.getValue(ptr + 8, "double") - cropLeft;
            const bottom = m.pdfium.getValue(ptr + 16, "double") - cropBottom, top = m.pdfium.getValue(ptr + 24, "double") - cropBottom;
            const baseline = m.pdfium.getValue(ptr + 40, "double") - cropBottom;
            const length = m.FPDFText_GetFontInfo(textPage, index, 0, 0, ptr);
            let font = "Arial";
            if (length > 0 && length < 512) {
              const name = alloc(length);
              try { m.FPDFText_GetFontInfo(textPage, index, name, length, ptr); font = m.pdfium.UTF8ToString(name); }
              finally { free(name); }
            }
            let color = "202020";
            if (m.FPDFText_GetFillColor(textPage, index, ptr + 48, ptr + 52, ptr + 56, ptr + 60)) {
              color = [48, 52, 56].map(offset => Math.max(0, Math.min(255, m.pdfium.getValue(ptr + offset, "i32"))).toString(16).padStart(2, "0")).join("");
            }
            let scaleY = 1;
            if (m.FPDFText_GetMatrix(textPage, index, ptr)) scaleY = Math.hypot(m.pdfium.getValue(ptr + 8, "float"), m.pdfium.getValue(ptr + 12, "float"));
            positioned.push({ text: String.fromCodePoint(code), left, right, top, bottom, baseline, size: m.FPDFText_GetFontSize(textPage, index) * scaleY, bold: /bold|black|semibold/i.test(font), font, color });
          }
        } finally { free(ptr); m.FPDFText_ClosePage(textPage); textPage = 0; }
        const blocks = pdfReadingOrder(positioned, p, width, true);
        if (p === 0) {
          pageWidth = width; pageHeight = height;
          margin = Math.max(24, Math.min(54, ...blocks.map(block => block.layout!.left)));
        }
        totalBlocks += blocks.length;
        if (totalBlocks > 2000 || blocks.some(block => block.text.length > 2000)) throw new Error("PDF terlalu kompleks untuk dikonversi.");
        // Hide text recursively, including Form XObjects, so the background never duplicates old wording.
        const hideText = (parent: number, form = false, depth = 0) => {
          if (depth > 20) throw new Error("Struktur PDF terlalu kompleks.");
          const objects = form ? m.FPDFFormObj_CountObjects(parent) : m.FPDFPage_CountObjects(parent);
          totalObjects += objects;
          if (totalObjects > 20_000) throw new Error("PDF terlalu kompleks untuk dikonversi.");
          for (let i = 0; i < objects; i++) {
            const object = form ? m.FPDFFormObj_GetObject(parent, i) : m.FPDFPage_GetObject(parent, i);
            const type = m.FPDFPageObj_GetType(object);
            if (type === 1 && !m.FPDFPageObj_SetIsActive(object, false)) throw new Error("Teks PDF belum dapat dikonversi dengan aman.");
            if (type === 5) hideText(object, true, depth + 1);
          }
        };
        hideText(page);
        const scale = Math.min(1.5, 1200 / Math.max(width, height));
        const pixelWidth = Math.ceil(width * scale), pixelHeight = Math.ceil(height * scale);
        const bitmap = m.FPDFBitmap_Create(pixelWidth, pixelHeight, 0);
        if (!bitmap) throw new Error("Gambar latar PDF gagal dibuat.");
        const graphics: FlowGraphic[] = [];
        try {
          m.FPDFBitmap_FillRect(bitmap, 0, 0, pixelWidth, pixelHeight, 0xffffffff);
          m.FPDF_RenderPageBitmap(bitmap, page, 0, 0, pixelWidth, pixelHeight, 0, 0);
          const stride = m.FPDFBitmap_GetStride(bitmap), buffer = m.FPDFBitmap_GetBuffer(bitmap);
          const pixels = heap().subarray(buffer, buffer + stride * pixelHeight);
          graphics.push(...extractFlowGraphics(pixels, pixelWidth, pixelHeight, stride, scale, p, files, relationships));
          totalBackgroundBytes = Object.values(files).reduce((sum, file) => sum + file.length, 0);
          if (totalBackgroundBytes > 8 * 1024 * 1024) throw new Error("Gambar PDF terlalu besar untuk hasil DOCX. Kompres PDF lalu coba lagi.");
        } finally { m.FPDFBitmap_Destroy(bitmap); }
        body.push(flowPage(blocks, graphics, pageWidth, height, margin));
      } finally { if (textPage) m.FPDFText_ClosePage(textPage); m.FPDF_ClosePage(page); }
    }
    if (!totalBlocks) throw new Error("PDF scan belum bisa dikonversi menjadi teks editable. Gunakan PDF teks atau DOCX asli.");
    body.push(`<w:sectPr><w:pgSz w:w="${Math.round(pageWidth * 20)}" w:h="${Math.round(pageHeight * 20)}"/><w:pgMar w:top="${Math.round(margin * 20)}" w:right="${Math.round(margin * 20)}" w:bottom="${Math.round(margin * 20)}" w:left="${Math.round(margin * 20)}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`);
    const ns = 'xmlns:cvflow="urn:lamaranku:cv-flow:1" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    files["word/document.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${ns}><w:body>${body.join("")}</w:body></w:document>`);
    files["word/styles.xml"] = strToU8(`<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style></w:styles>`);
    files["word/_rels/document.xml.rels"] = strToU8(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${relationships.join("")}</Relationships>`);
    files["_rels/.rels"] = strToU8('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="document" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    files["[Content_Types].xml"] = strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
    signal?.throwIfAborted();
    return zipSync(files);
  } finally { m.FPDF_CloseDocument(doc); free(source); }
}
