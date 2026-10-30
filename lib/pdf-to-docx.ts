import { deflateSync } from "node:zlib";
import { strToU8, zipSync } from "fflate";
import { MAX_REPAIR_BYTES, pdfium } from "./pdf-repair";
import { pdfReadingOrder, type PdfBlock, type PdfCharacter } from "./pdf-layout";

const escapeXml = (text: string) => text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]!));
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

function textBox(block: PdfBlock, height: number, width: number, id: number) {
  const layout = block.layout!;
  const size = Math.max(6, Math.min(72, layout.size));
  let left = Math.max(0, layout.left - .5);
  const top = Math.max(0, height - layout.baseline - (layout.lineHeight - size * .25));
  const boxWidth = Math.min(width - left, Math.max(layout.right - layout.left + size, 24));
  const boxHeight = Math.max(size * 1.5, layout.top - layout.bottom + size * .7);
  const center = height - layout.baseline < height * .18 && ["title", "metadata", "subheading"].includes(block.kind)
    && layout.right - layout.left < width * .85 && Math.abs((layout.left + layout.right) / 2 - width / 2) < 8;
  if (center) left = Math.max(0, (width - boxWidth) / 2);
  const heading = ["title", "heading", "subheading"].includes(block.kind);
  const style = block.kind === "title" ? "Title" : heading ? "Heading1" : "Normal";
  const rawFont = layout.font.replace(/^[A-Z]{6}\+/, "");
  const font = /^Arial/i.test(rawFont) ? "Arial" : /^TimesNewRoman/i.test(rawFont) ? "Times New Roman"
    : rawFont.replace(/[-,]?(Bold|Italic|Regular|Semibold|BoldItalic).*$/i, "").replace(/PSMT$|MT$/i, "") || "Arial";
  // The bullet glyph is text, so it remains editable with the rest of the paragraph.
  const text = block.text;
  return `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/></w:pPr><w:r><w:pict><v:rect id="text${id}" filled="f" stroked="f" style="position:absolute;margin-left:${left.toFixed(2)}pt;margin-top:${top.toFixed(2)}pt;width:${boxWidth.toFixed(2)}pt;height:${boxHeight.toFixed(2)}pt;z-index:1;mso-position-horizontal-relative:page;mso-position-vertical-relative:page"><v:textbox inset="0,0,0,0" style="mso-fit-shape-to-text:t"><w:txbxContent><w:p><w:pPr><w:pStyle w:val="${style}"/><w:jc w:val="${center ? "center" : "left"}"/><w:spacing w:before="0" w:after="0" w:line="${Math.round(layout.lineHeight * 20)}" w:lineRule="exact"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${escapeXml(font)}" w:hAnsi="${escapeXml(font)}"/><w:sz w:val="${Math.round(size * 2)}"/><w:color w:val="${layout.color}"/>${layout.bold ? "<w:b/>" : ""}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p></w:txbxContent></v:textbox></v:rect></w:pict></w:r></w:p>`;
}

/** Convert PDF text into editable Word text boxes over a non-text visual background. */
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
        let background: Uint8Array;
        try {
          m.FPDFBitmap_FillRect(bitmap, 0, 0, pixelWidth, pixelHeight, 0xffffffff);
          m.FPDF_RenderPageBitmap(bitmap, page, 0, 0, pixelWidth, pixelHeight, 0, 0);
          const stride = m.FPDFBitmap_GetStride(bitmap), buffer = m.FPDFBitmap_GetBuffer(bitmap);
          background = backgroundPng(heap().subarray(buffer, buffer + stride * pixelHeight), pixelWidth, pixelHeight, stride);
        } finally { m.FPDFBitmap_Destroy(bitmap); }
        totalBackgroundBytes += background.length;
        if (totalBackgroundBytes > 8 * 1024 * 1024) throw new Error("Gambar PDF terlalu besar untuk hasil DOCX. Kompres PDF lalu coba lagi.");
        files[`word/media/page${p + 1}.png`] = background;
        relationships.push(`<Relationship Id="bg${p + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${p + 1}.png"/>`);
        body.push(`<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/></w:pPr><w:r><w:pict><v:rect id="background${p + 1}" filled="t" stroked="f" style="position:absolute;margin-left:0pt;margin-top:0pt;width:${width.toFixed(2)}pt;height:${height.toFixed(2)}pt;z-index:-1;mso-position-horizontal-relative:page;mso-position-vertical-relative:page"><v:imagedata r:id="bg${p + 1}"/></v:rect></w:pict></w:r></w:p>`);
        body.push(...blocks.map((block, index) => textBox(block, height, width, p * 2000 + index)));
        const section = `<w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="${Math.round(width * 20)}" w:h="${Math.round(height * 20)}"/><w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>`;
        // Each section carries its own page size; the next section starts on a new page.
        body.push(p === count - 1 ? section : `<w:p><w:pPr>${section}</w:pPr></w:p>`);
      } finally { if (textPage) m.FPDFText_ClosePage(textPage); m.FPDF_ClosePage(page); }
    }
    if (!totalBlocks) throw new Error("PDF scan belum bisa dikonversi menjadi teks editable. Gunakan PDF teks atau DOCX asli.");
    const ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    files["word/document.xml"] = strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${ns}><w:body>${body.join("")}</w:body></w:document>`);
    files["word/styles.xml"] = strToU8(`<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style></w:styles>`);
    files["word/_rels/document.xml.rels"] = strToU8(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${relationships.join("")}</Relationships>`);
    files["_rels/.rels"] = strToU8('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="document" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    files["[Content_Types].xml"] = strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
    signal?.throwIfAborted();
    return zipSync(files);
  } finally { m.FPDF_CloseDocument(doc); free(source); }
}
