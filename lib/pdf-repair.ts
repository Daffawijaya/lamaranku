import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { init, type WrappedPdfiumModule } from "@embedpdf/pdfium";
import { pdfReadingOrder, type PdfBlock, type PdfCharacter } from "./pdf-layout";

export const MAX_REPAIR_BYTES = 10 * 1024 * 1024;
export type PdfRevision = { id: string; text: string };
type Bounds = [number, number, number, number];
type Segment = { id: string; text: string; object: number; index: number; page: number; bounds: Bounds };
let engine: Promise<WrappedPdfiumModule> | undefined;
export async function pdfium() {
  if (!engine) {
    engine = (async () => {
      const wasmBinary = await readFile(join(process.cwd(), "node_modules", "@embedpdf", "pdfium", "dist", "pdfium.wasm"));
      const result = await init({ wasmBinary });
      result.PDFiumExt_Init();
      return result;
    })().catch(error => { engine = undefined; throw error; });
  }
  return engine;
}

export async function openRepairPdf(data: Uint8Array) {
  if (data.byteLength > MAX_REPAIR_BYTES || !Buffer.from(data.subarray(0, 1024)).includes(Buffer.from("%PDF-"))) throw new Error("Gunakan berkas PDF maksimal 10 MB.");
  const m = await pdfium();
  const alloc = (size: number) => m.pdfium.wasmExports.malloc(size);
  const free = (ptr: number) => m.pdfium.wasmExports.free(ptr);
  const heap = () => (m.pdfium as typeof m.pdfium & { HEAPU8: Uint8Array }).HEAPU8;
  const source = alloc(data.length);
  heap().set(data, source);
  const doc = m.FPDF_LoadMemDocument(source, data.length, "");
  if (!doc) { free(source); throw new Error("PDF tidak dapat dibaca. Gunakan PDF tanpa kata sandi."); }
  const pages: number[] = [];
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    pages.forEach(page => m.FPDF_ClosePage(page));
    m.FPDF_CloseDocument(doc);
    free(source);
  };
  const bounds = (object: number): Bounds => {
    const ptr = alloc(16);
    try {
      if (!m.FPDFPageObj_GetBounds(object, ptr, ptr + 4, ptr + 8, ptr + 12)) throw new Error("Posisi teks PDF tidak terbaca.");
      return [0, 4, 8, 12].map(offset => m.pdfium.getValue(ptr + offset, "float")) as Bounds;
    } finally { free(ptr); }
  };
  const objectText = (object: number, textPage: number) => {
    const size = m.FPDFTextObj_GetText(object, textPage, 0, 0);
    if (!size || size > 160_000) return "";
    const ptr = alloc(size);
    try { m.FPDFTextObj_GetText(object, textPage, ptr, size); return m.pdfium.UTF16ToString(ptr).replace(/[\r\n]+$/g, ""); }
    finally { free(ptr); }
  };
  const setText = (object: number, text: string) => {
    const ptr = alloc((text.length + 1) * 2);
    try { m.pdfium.stringToUTF16(text, ptr, (text.length + 1) * 2); return m.FPDFText_SetText(object, ptr); }
    finally { free(ptr); }
  };
  try {
    const count = m.FPDF_GetPageCount(doc);
    if (count < 1 || count > 50) throw new Error("Perbaikan mendukung PDF 1–50 halaman.");
    if (m.FPDF_GetSignatureCount(doc)) throw new Error("Gunakan salinan CV tanpa tanda tangan digital untuk diperbaiki.");
    const segments: Segment[] = [];
    let textSize = 0;
    let objectCount = 0;
    let readableCharacters = 0;
    for (let p = 0; p < count; p++) {
      const page = m.FPDF_LoadPage(doc, p);
      if (!page) throw new Error("Halaman PDF tidak dapat dibaca.");
      pages.push(page);
      const textPage = m.FPDFText_LoadPage(page);
      if (!textPage) throw new Error("Teks PDF tidak dapat dibaca.");
      try {
        readableCharacters += Math.max(0, m.FPDFText_CountChars(textPage));
        const objects = m.FPDFPage_CountObjects(page);
        objectCount += objects;
        if (objectCount > 20_000) throw new Error("PDF terlalu kompleks untuk perbaikan otomatis.");
        for (let i = 0; i < objects; i++) {
          const object = m.FPDFPage_GetObject(page, i);
          if (m.FPDFPageObj_GetType(object) !== 1) continue;
          const text = objectText(object, textPage);
          if (!text.trim()) continue;
          textSize += text.length;
          if (textSize > 80_000 || segments.length >= 2000) throw new Error("Teks PDF terlalu panjang untuk perbaikan otomatis.");
          segments.push({ id: `P${p + 1}T${i}`, text, object, index: i, page: p, bounds: bounds(object) });
        }
      } finally { m.FPDFText_ClosePage(textPage); }
    }
    const editable = segments.filter(s => s.text.trim().length >= 35 && !/[\r\n]|https?:|www\.|\S+@\S+/i.test(s.text));
    if (!editable.length) {
      if (!readableCharacters) throw new Error("PDF ini tidak memiliki teks yang dapat diedit. Ekspor ulang CV sebagai PDF teks, bukan hasil scan atau gambar.");
      throw new Error("Teks CV dapat dibaca untuk review, tetapi tersusun dalam potongan pendek, beberapa baris, atau objek yang belum mendukung edit dengan format asli. Ekspor ulang dari dokumen sumber sebagai PDF teks. Saran revisi pada hasil review tetap dapat digunakan secara manual.");
    }
    return {
      segments: segments.map(({ id, text }) => ({ id, text })),
      editableIds: editable.map(s => s.id),
      close,
      apply(revisions: PdfRevision[]) {
        if (closed) throw new Error("Dokumen sudah ditutup.");
        const valid = validatePdfRevisions(revisions, editable);
        const changed = new Set<number>();
        const applied: { before: string; after: string }[] = [];
        let skipped = 0;
        // Probe a separate document so rejected edits never disturb original kerning.
        const probe = m.FPDF_LoadMemDocument(source, data.length, "");
        if (!probe) throw new Error("Salinan PDF untuk validasi gagal dibuka.");
        const probePages = new Map<number, number>();
        const acceptedEdits: { segment: Segment; text: string }[] = [];
        try {
          for (const revision of valid) {
            const segment = editable.find(s => s.id === revision.id)!;
            if (segment.text === revision.text) continue;
            let page = probePages.get(segment.page);
            if (!page) {
              page = m.FPDF_LoadPage(probe, segment.page);
              if (!page) throw new Error("Halaman validasi PDF gagal dibuka.");
              probePages.set(segment.page, page);
            }
            const object = m.FPDFPage_GetObject(page, segment.index);
            let accepted = false;
            if (setText(object, revision.text)) {
              const next = bounds(object);
              const old = segment.bounds;
              const fits = next.every(Number.isFinite) && next[0] >= old[0] - 0.5 && next[1] >= old[1] - 0.5 && next[2] <= old[2] + 0.5 && next[3] <= old[3] + 0.5;
              const textPage = m.FPDFText_LoadPage(page);
              try { accepted = fits && Boolean(textPage) && objectText(object, textPage) === revision.text; }
              finally { if (textPage) m.FPDFText_ClosePage(textPage); }
            }
            if (accepted) acceptedEdits.push({ segment, text: revision.text });
            else skipped++;
          }
        } finally {
          probePages.forEach(page => m.FPDF_ClosePage(page));
          m.FPDF_CloseDocument(probe);
        }
        for (const { segment, text } of acceptedEdits) {
          if (!setText(segment.object, text)) throw new Error("Revisi gagal ditulis. PDF hasil tidak dibuat.");
          changed.add(segment.page);
          applied.push({ before: segment.text, after: text });
        }
        if (!applied.length) throw new Error("Belum ada revisi yang dapat diterapkan tanpa mengubah format PDF. Coba lagi dengan PDF lain.");
        for (const page of changed) if (!m.FPDFPage_GenerateContent(pages[page])) throw new Error("PDF hasil belum dapat dibuat.");
        const writer = m.PDFiumExt_OpenFileWriter();
        try {
          if (!m.FPDF_SaveAsCopy(doc, writer, 2)) throw new Error("PDF hasil gagal disimpan.");
          const size = m.PDFiumExt_GetFileWriterSize(writer);
          const ptr = alloc(size);
          try {
            m.PDFiumExt_GetFileWriterData(writer, ptr, size);
            return { bytes: heap().slice(ptr, ptr + size), applied, skipped };
          } finally { free(ptr); }
        } finally { m.PDFiumExt_CloseFileWriter(writer); }
      },
    };
  } catch (error) { close(); throw error; }
}

/** Rebuild from the page's reading-order text, including text inside Form objects. */
export async function openRebuildPdf(data: Uint8Array) {
  if (data.byteLength > MAX_REPAIR_BYTES || !Buffer.from(data.subarray(0, 1024)).includes(Buffer.from("%PDF-"))) throw new Error("Gunakan berkas PDF maksimal 10 MB.");
  const m = await pdfium();
  const alloc = (size: number) => m.pdfium.wasmExports.malloc(size);
  const free = (ptr: number) => m.pdfium.wasmExports.free(ptr);
  const source = alloc(data.length);
  (m.pdfium as typeof m.pdfium & { HEAPU8: Uint8Array }).HEAPU8.set(data, source);
  const doc = m.FPDF_LoadMemDocument(source, data.length, "");
  if (!doc) { free(source); throw new Error("PDF tidak dapat dibaca. Gunakan PDF tanpa kata sandi."); }
  const segments: PdfBlock[] = [];
  try {
    const count = m.FPDF_GetPageCount(doc);
    if (count < 1 || count > 50) throw new Error("Perbaikan mendukung PDF 1–50 halaman.");
    if (m.FPDF_GetSignatureCount(doc)) throw new Error("Gunakan salinan CV tanpa tanda tangan digital untuk diperbaiki.");
    let total = 0;
    for (let p = 0; p < count; p++) {
      const page = m.FPDF_LoadPage(doc, p);
      if (!page) throw new Error("Halaman PDF tidak dapat dibaca.");
      let textPage = 0;
      try {
        textPage = m.FPDFText_LoadPage(page);
        if (!textPage) throw new Error("Teks PDF tidak dapat dibaca.");
        const chars = m.FPDFText_CountChars(textPage);
        total += Math.max(0, chars);
        if (total > 80_000) throw new Error("Teks PDF terlalu panjang untuk perbaikan otomatis.");
        if (chars <= 0) continue;
        const ptr = alloc(48);
        const positioned: PdfCharacter[] = [];
        try {
          for (let index = 0; index < chars; index++) {
            const rawCode = m.FPDFText_GetUnicode(textPage, index);
            const code = m.FPDFText_IsHyphen(textPage, index) === 1 ? 45 : rawCode;
            if (code < 32 || code > 0x10ffff) continue;
            if (!m.FPDFText_GetCharBox(textPage, index, ptr, ptr + 8, ptr + 16, ptr + 24)
              || !m.FPDFText_GetCharOrigin(textPage, index, ptr + 32, ptr + 40)) continue;
            const fontLength = m.FPDFText_GetFontInfo(textPage, index, 0, 0, ptr);
            let bold = false;
            if (fontLength > 0 && fontLength < 512) {
              const name = alloc(fontLength);
              try { m.FPDFText_GetFontInfo(textPage, index, name, fontLength, ptr); bold = /bold|black|semibold/i.test(m.pdfium.UTF8ToString(name)); }
              finally { free(name); }
            }
            // GetFontInfo writes its flags to ptr; read character bounds again.
            m.FPDFText_GetCharBox(textPage, index, ptr, ptr + 8, ptr + 16, ptr + 24);
            positioned.push({ text: String.fromCodePoint(code), left: m.pdfium.getValue(ptr, "double"), right: m.pdfium.getValue(ptr + 8, "double"), baseline: m.pdfium.getValue(ptr + 40, "double"), size: m.FPDFText_GetFontSize(textPage, index), bold });
          }
          const blocks = pdfReadingOrder(positioned, p, m.FPDF_GetPageWidth(page));
          if (segments.length + blocks.length > 2000 || blocks.some(b => b.text.length > 2000)) throw new Error("Teks PDF terlalu panjang untuk perbaikan otomatis.");
          segments.push(...blocks);
        } finally { free(ptr); }
      } finally { if (textPage) m.FPDFText_ClosePage(textPage); m.FPDF_ClosePage(page); }
    }
  } finally { m.FPDF_CloseDocument(doc); free(source); }
  if (!segments.length) throw new Error("PDF ini tidak memiliki teks yang dapat dibaca. Ekspor PDF teks terlebih dahulu; PDF scan memerlukan OCR.");
  const editable = segments.filter(s => ["paragraph", "bullet"].includes(s.kind) && s.text.length >= 20 && s.text.split(/\s+/).length >= 4 && !/https?:|www\.|\S+@\S+/i.test(s.text));
  if (!editable.length) throw new Error("Belum ada kalimat yang cukup lengkap untuk diperbaiki. Gunakan PDF dengan isi pengalaman atau ringkasan CV.");
  let closed = false;
  return {
    segments,
    editableIds: editable.map(s => s.id),
    close() { closed = true; },
    async apply(revisions: PdfRevision[]) {
      if (closed) throw new Error("Dokumen sudah ditutup.");
      const valid = validatePdfRevisions(revisions, editable, true);
      const skipped = revisions.length - valid.length;
      const applied = valid.filter(r => r.text !== editable.find(s => s.id === r.id)!.text).map(r => ({ before: editable.find(s => s.id === r.id)!.text, after: r.text }));
      if (!applied.length) throw new Error(skipped ? "Semua revisi AI mengubah angka atau kontak sehingga belum aman diterapkan. Data asli tetap utuh. Coba perbaiki lagi agar AI menyusun ulang sarannya." : "AI belum menghasilkan perubahan kalimat. Saran review tetap tersedia; coba lagi dengan fokus perbaikan yang lebih spesifik.");
      const changed = new Map(valid.map(r => [r.id, r.text]));
      const fonts = await Promise.all(["myriadpro-regular.otf", "myriadpro-bold.otf"].map(name => readFile(join(process.cwd(), "app", "fonts", name))));
      const output = m.FPDF_CreateNewDocument();
      if (!output) throw new Error("Dokumen hasil belum dapat dibuat.");
      const fontPointers: number[] = [], loadedFonts: number[] = [];
      const scratch = alloc(16);
      let page = 0, pageNumber = 0, y = 790;
      const finishPage = () => {
        if (page && !m.FPDFPage_GenerateContent(page)) throw new Error("Halaman hasil belum dapat dibuat.");
        if (page) { m.FPDF_ClosePage(page); page = 0; }
      };
      try {
        for (const bytes of fonts) {
          const ptr = alloc(bytes.length); fontPointers.push(ptr);
          (m.pdfium as typeof m.pdfium & { HEAPU8: Uint8Array }).HEAPU8.set(bytes, ptr);
          const font = m.FPDFText_LoadFont(output, ptr, bytes.length, 1, true);
          if (!font) throw new Error("Font PDF hasil gagal dimuat.");
          loadedFonts.push(font);
        }
        const newPage = () => {
          finishPage();
          if (pageNumber >= 50) throw new Error("PDF hasil melebihi 50 halaman.");
          page = m.FPDFPage_New(output, pageNumber++, 595.28, 841.89); y = 790;
          if (!page) throw new Error("Halaman hasil gagal dibuat.");
        };
        const textObject = (text: string, font: number, size: number) => {
          const obj = m.FPDFPageObj_CreateTextObj(output, font, size);
          if (!obj) throw new Error("Objek teks hasil gagal dibuat.");
          const ptr = alloc((text.length + 1) * 2);
          try {
            m.pdfium.stringToUTF16(text, ptr, (text.length + 1) * 2);
            if (!m.FPDFText_SetText(obj, ptr)) throw new Error("Teks hasil gagal ditulis.");
          } catch (error) { m.FPDFPageObj_Destroy(obj); throw error; }
          finally { free(ptr); }
          return obj;
        };
        const width = (text: string, font: number, size: number) => {
          const obj = textObject(text, font, size);
          try {
            if (!m.FPDFPageObj_GetBounds(obj, scratch, scratch + 4, scratch + 8, scratch + 12)) throw new Error("Ukuran teks hasil tidak terbaca.");
            return m.pdfium.getValue(scratch + 8, "float") - m.pdfium.getValue(scratch, "float");
          } finally { m.FPDFPageObj_Destroy(obj); }
        };
        newPage();
        for (const [index, segment] of segments.entries()) {
          const text = changed.get(segment.id) ?? segment.text;
          const bullet = segment.kind === "bullet";
          const heading = ["title", "heading", "subheading"].includes(segment.kind);
          const size = segment.kind === "title" ? 20 : segment.kind === "heading" ? 12 : 10.5;
          const font = loadedFonts[heading ? 1 : 0];
          // Refuse unsupported glyphs rather than silently losing names or punctuation.
          for (const char of text) if (!/\s/.test(char) && !m.FPDFFont_GetGlyphWidth(font, char.codePointAt(0)!, size, scratch)) throw new Error("Ada karakter yang belum didukung font PDF hasil. Gunakan teks CV dengan karakter standar.");
          let line = "";
          const lines: string[] = [];
          for (const char of text) {
            const candidate = line + char;
            if (line && width(candidate, font, size) > (bullet ? 479 : 491)) {
              const space = line.lastIndexOf(" ");
              if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1) + char; }
              else { lines.push(line); line = char; }
            } else line = candidate;
          }
          if (line.trim()) lines.push(line.trim());
          const blockHeight = lines.length * size * 1.45 + 8;
          const reserve = segment.kind === "heading" ? 95 : segment.kind === "subheading" ? 65 : 0;
          if (blockHeight + reserve < 700 && y - blockHeight - reserve < 48) newPage();
          if (segment.kind === "heading" && index > 0) y -= 8;
          for (const [lineIndex, line] of lines.entries()) {
            if (y - size * 1.45 < 48) newPage();
            if (bullet && lineIndex === 0) {
              const marker = textObject("•", font, size);
              m.FPDFPageObj_SetFillColor(marker, 32, 32, 32, 255);
              m.FPDFPageObj_Transform(marker, 1, 0, 0, 1, 52, y);
              m.FPDFPage_InsertObject(page, marker);
            }
            const obj = textObject(line, font, size);
            m.FPDFPageObj_SetFillColor(obj, 32, 32, 32, 255);
            m.FPDFPageObj_Transform(obj, 1, 0, 0, 1, bullet ? 64 : 52, y);
            m.FPDFPage_InsertObject(page, obj);
            y -= size * 1.45;
          }
          y -= heading ? 7 : segment.kind === "bullet" ? 6 : 4;
        }
        finishPage();
        const writer = m.PDFiumExt_OpenFileWriter();
        try {
          if (!m.FPDF_SaveAsCopy(output, writer, 2)) throw new Error("PDF hasil gagal disimpan.");
          const size = m.PDFiumExt_GetFileWriterSize(writer), ptr = alloc(size);
          try {
            m.PDFiumExt_GetFileWriterData(writer, ptr, size);
            const bytes = (m.pdfium as typeof m.pdfium & { HEAPU8: Uint8Array }).HEAPU8.slice(ptr, ptr + size);
            return { bytes, applied, skipped };
          } finally { free(ptr); }
        } finally { m.PDFiumExt_CloseFileWriter(writer); }
      } finally {
        if (page) m.FPDF_ClosePage(page);
        loadedFonts.forEach(font => m.FPDFFont_Close(font));
        m.FPDF_CloseDocument(output);
        fontPointers.forEach(free); free(scratch);
      }
    },
  };
}

export function validatePdfRevisions(value: unknown, segments: { id: string; text: string }[], skipUnsafeFacts = false): PdfRevision[] {
  if (!Array.isArray(value) || value.length > segments.length) throw new Error("Revisi AI tidak valid.");
  const seen = new Set<string>();
  return value.flatMap(revision => {
    if (!revision || typeof revision.id !== "string" || typeof revision.text !== "string") throw new Error("Revisi AI tidak lengkap.");
    const original = segments.find(s => s.id === revision.id);
    if (!original || seen.has(revision.id) || !revision.text.trim() || revision.text.length > 2000 || /[\r\n\u0000-\u001f]/.test(revision.text)) throw new Error("Revisi AI tidak sesuai potongan PDF.");
    seen.add(revision.id);
    // Numbers and proper contact details must never be fabricated or removed.
    const facts = (text: string) => text.match(/\d+(?:[.,:/-]\d+)*|\S+@\S+|https?:\/\/\S+/g) ?? [];
    if (JSON.stringify(facts(original.text)) !== JSON.stringify(facts(revision.text))) {
      if (skipUnsafeFacts) return [];
      throw new Error("Revisi AI mengubah angka atau kontak asli. Silakan coba lagi.");
    }
    return [{ id: revision.id, text: revision.text.trim() }];
  });
}
