import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { init, type WrappedPdfiumModule } from "@embedpdf/pdfium";

export const MAX_REPAIR_BYTES = 10 * 1024 * 1024;
export type PdfRevision = { id: string; text: string };
type Bounds = [number, number, number, number];
type Segment = { id: string; text: string; object: number; index: number; page: number; bounds: Bounds };
let engine: Promise<WrappedPdfiumModule> | undefined;
async function pdfium() {
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
    try { m.FPDFTextObj_GetText(object, textPage, ptr, size); return m.pdfium.UTF16ToString(ptr); }
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
    for (let p = 0; p < count; p++) {
      const page = m.FPDF_LoadPage(doc, p);
      if (!page) throw new Error("Halaman PDF tidak dapat dibaca.");
      pages.push(page);
      const textPage = m.FPDFText_LoadPage(page);
      if (!textPage) throw new Error("Teks PDF tidak dapat dibaca.");
      try {
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
    if (!editable.length) throw new Error("Teks PDF ini belum mendukung perbaikan dengan format asli. Gunakan PDF berisi teks yang dapat dipilih.");
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

export function validatePdfRevisions(value: unknown, segments: { id: string; text: string }[]): PdfRevision[] {
  if (!Array.isArray(value) || value.length > segments.length) throw new Error("Revisi AI tidak valid.");
  const seen = new Set<string>();
  return value.map(revision => {
    if (!revision || typeof revision.id !== "string" || typeof revision.text !== "string") throw new Error("Revisi AI tidak lengkap.");
    const original = segments.find(s => s.id === revision.id);
    if (!original || seen.has(revision.id) || !revision.text.trim() || revision.text.length > 2000 || /[\r\n\u0000-\u001f]/.test(revision.text)) throw new Error("Revisi AI tidak sesuai potongan PDF.");
    // Numbers and proper contact details must never be fabricated or removed.
    const facts = (text: string) => text.match(/\d+(?:[.,:/-]\d+)*|\S+@\S+|https?:\/\/\S+/g) ?? [];
    if (JSON.stringify(facts(original.text)) !== JSON.stringify(facts(revision.text))) throw new Error("Revisi AI mengubah angka atau kontak asli. Silakan coba lagi.");
    seen.add(revision.id);
    return { id: revision.id, text: revision.text.trim() };
  });
}
