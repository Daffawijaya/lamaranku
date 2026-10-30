const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { init } = require('@embedpdf/pdfium');

function load(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8').replace('import.meta.url', JSON.stringify(require('node:url').pathToFileURL(path.resolve(file)).href));
  const mod = { exports: {} };
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText)(name => name in mocks ? mocks[name] : require(name), mod.exports);
  return mod.exports;
}
const { hasActivePlus } = load('lib/plus-access.ts');
const { openRepairPdf, validatePdfRevisions } = load('lib/pdf-repair.ts');

test('Plus requires admin metadata and rejects expired or malformed entitlements', () => {
  assert.equal(hasActivePlus({ user_metadata: { plan: 'plus' } }), false);
  assert.equal(hasActivePlus({ app_metadata: { plan: 'basic' } }), false);
  assert.equal(hasActivePlus({ app_metadata: { plan: 'plus' } }), true);
  assert.equal(hasActivePlus({ app_metadata: { plan: 'plus', plus_until: 'invalid' } }), false);
  assert.equal(hasActivePlus({ app_metadata: { plan: 'plus', plus_until: '2026-01-01' } }, Date.parse('2026-10-30')), false);
  assert.equal(hasActivePlus({ app_metadata: { plan: 'plus', plus_until: '2027-01-01' } }, Date.parse('2026-10-30')), true);
});

test('AI cannot target unknown objects, duplicate replacements, or invent numerical facts', () => {
  const segments = [{ id: 'P1T1', text: 'Mengelola 20 proyek pada 2025.' }];
  assert.throws(() => validatePdfRevisions([{ id: 'P2T2', text: 'Test' }], segments));
  assert.throws(() => validatePdfRevisions([{ id: 'P1T1', text: 'Memimpin 50 proyek pada 2025.' }], segments));
  assert.throws(() => validatePdfRevisions([{ id: 'P1T1', text: 'Baris\nbaru 20 2025' }], segments));
  assert.throws(() => validatePdfRevisions([{ id: 'P1T1', text: '20 2025' }, { id: 'P1T1', text: '20 2025' }], segments));
  assert.equal(validatePdfRevisions([{ id: 'P1T1', text: 'Menangani 20 proyek pada 2025.' }], segments).length, 1);
});

async function engine() {
  const m = await init({ wasmBinary: fs.readFileSync(require.resolve('@embedpdf/pdfium/pdfium.wasm')) });
  m.PDFiumExt_Init();
  return m;
}
function save(m, doc) {
  const w = m.PDFiumExt_OpenFileWriter();
  let ptr;
  try {
    assert.equal(m.FPDF_SaveAsCopy(doc, w, 2), true);
    const size = m.PDFiumExt_GetFileWriterSize(w);
    ptr = m.pdfium.wasmExports.malloc(size);
    assert.equal(m.PDFiumExt_GetFileWriterData(w, ptr, size), size);
    return m.pdfium.HEAPU8.slice(ptr, ptr + size);
  } finally { if (ptr) m.pdfium.wasmExports.free(ptr); m.PDFiumExt_CloseFileWriter(w); }
}
function fixture(m) {
  const doc = m.FPDF_CreateNewDocument();
  const ptr = m.pdfium.wasmExports.malloc(4096);
  const text = (page, value, size, x, y, rgb = [32, 40, 55]) => {
    const obj = m.FPDFPageObj_NewTextObj(doc, 'Helvetica', size);
    m.pdfium.stringToUTF16(value, ptr, 4096);
    assert.equal(m.FPDFText_SetText(obj, ptr), true);
    m.FPDFPageObj_SetFillColor(obj, ...rgb, 255);
    m.FPDFPageObj_Transform(obj, 1, 0, 0, 1, x, y);
    m.FPDFPage_InsertObject(page, obj);
  };
  try {
    for (let i = 0; i < 2; i++) {
      const p = m.FPDFPage_New(doc, i, 595, 842);
      const line = m.FPDFPageObj_CreateNewRect(48, 733, 499, 2);
      m.FPDFPageObj_SetFillColor(line, 53, 100, 250, 255);
      m.FPDFPath_SetDrawMode(line, 2, false);
      m.FPDFPage_InsertObject(p, line);
      text(p, 'DAFFA WIJAYA', 24, 48, 780);
      text(p, 'Web Developer', 14, 48, 754, [53, 100, 250]);
      text(p, 'daffa@example.com | Jakarta', 10, 48, 713);
      text(p, 'Pengalaman', 16, 48, 666);
      text(p, 'Saya membantu membuat aplikasi website untuk perusahaan.', 11, 48, 640);
      text(p, 'Saya melakukan pengelolaan dokumentasi proyek perusahaan.', 11, 48, 620);
      text(p, 'React, Next.js, TypeScript', 11, 48, 590);
      assert.equal(m.FPDFPage_GenerateContent(p), true);
      m.FPDF_ClosePage(p);
    }
    return save(m, doc);
  } finally { m.pdfium.wasmExports.free(ptr); m.FPDF_CloseDocument(doc); }
}

test('PDF repair replaces selectable text, skips overflow, and preserves page geometry, font, colors and other objects', async () => {
  const m = await engine();
  const original = fixture(m);
  const pdf = await openRepairPdf(original);
  try {
    const first = pdf.segments.find(s => s.text.startsWith('Saya membantu'));
    const second = pdf.segments.find(s => s.text.startsWith('Saya melakukan'));
    const after = 'Membantu pengembangan aplikasi web perusahaan.';
    const result = pdf.apply([{ id: first.id, text: after }, { id: second.id, text: 'Pengelolaan dokumentasi proyek perusahaan yang sangat panjang '.repeat(8) }]);
    assert.equal(result.applied.length, 1);
    assert.equal(result.skipped, 1);
    const repaired = await openRepairPdf(result.bytes);
    try {
      assert.equal(repaired.segments.some(s => s.id === first.id && s.text === after), true);
      assert.equal(repaired.segments.find(s => s.id === second.id).text, second.text);
      for (const segment of pdf.segments.filter(s => s.id !== first.id)) assert.equal(repaired.segments.find(s => s.id === segment.id)?.text, segment.text);
    } finally { repaired.close(); }
    const inspect = bytes => {
      const ptr = m.pdfium.wasmExports.malloc(bytes.length);
      m.pdfium.HEAPU8.set(bytes, ptr);
      const doc = m.FPDF_LoadMemDocument(ptr, bytes.length, '');
      const out = [];
      const scratch = m.pdfium.wasmExports.malloc(40);
      try {
        assert.equal(m.FPDF_GetPageCount(doc), 2);
        for (let i = 0; i < 2; i++) {
          const page = m.FPDF_LoadPage(doc, i);
          try {
            const objects = [];
            for (let n = 0; n < m.FPDFPage_CountObjects(page); n++) {
              const obj = m.FPDFPage_GetObject(page, n);
              m.FPDFPageObj_GetMatrix(obj, scratch);
              const matrix = Array.from({ length: 6 }, (_, j) => m.pdfium.getValue(scratch + j * 4, 'float'));
              m.FPDFPageObj_GetFillColor(obj, scratch, scratch + 4, scratch + 8, scratch + 12);
              const color = [0, 4, 8, 12].map(n => m.pdfium.getValue(scratch + n, 'i32'));
              const isText = m.FPDFPageObj_GetType(obj) === 1;
              let fontSize = 0;
              if (isText) { m.FPDFTextObj_GetFontSize(obj, scratch); fontSize = m.pdfium.getValue(scratch, 'float'); }
              objects.push({ matrix, color, fontSize, type: m.FPDFPageObj_GetType(obj) });
            }
            out.push({ width: m.FPDF_GetPageWidth(page), height: m.FPDF_GetPageHeight(page), objects });
          } finally { m.FPDF_ClosePage(page); }
        }
        return out;
      } finally { m.pdfium.wasmExports.free(scratch); m.FPDF_CloseDocument(doc); m.pdfium.wasmExports.free(ptr); }
    };
    assert.deepEqual(inspect(result.bytes), inspect(original));
    fs.mkdirSync('tmp/pdfs', { recursive: true });
    fs.writeFileSync('tmp/pdfs/repair-source.pdf', original);
    fs.writeFileSync('tmp/pdfs/repair-result.pdf', result.bytes);
  } finally { pdf.close(); }
});

test('PDF rejects invalid bytes and never returns unchanged output as a successful repair', async () => {
  await assert.rejects(openRepairPdf(new TextEncoder().encode('not a pdf')));
  const m = await engine();
  const pdf = await openRepairPdf(fixture(m));
  try { assert.throws(() => pdf.apply([]), /Belum ada revisi/); }
  finally { pdf.close(); }
});

test('repair API rejects Basic and anonymous callers before parsing files or invoking AI', async () => {
  for (const user of [null, { app_metadata: { plan: 'basic' } }, { user_metadata: { plan: 'plus' } }]) {
    const route = load('app/api/skor/perbaiki/route.ts', {
      '../../../../lib/supabase/server': { supabaseServer: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) },
      '../../../../lib/plus-access': { hasActivePlus },
      '../../../../lib/pdf-repair': { MAX_REPAIR_BYTES: 10_485_760, openRepairPdf: () => assert.fail('must not parse PDF') },
      '../../../../lib/gemini-review': { requestGeminiReview: () => assert.fail('must not invoke AI') },
      '../../../../lib/review-config': { REVIEW_TIMEOUT_MS: 180000 },
    });
    const response = await route.POST(new Request('http://localhost/api/skor/perbaiki', { method: 'POST' }));
    assert.equal(response.status, user ? 403 : 401);
  }
});

test('paid repair API turns an AI revision into a downloadable original-format PDF', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key-no-network';
  const m = await engine();
  let aiCalls = 0;
  const route = load('app/api/skor/perbaiki/route.ts', {
    '../../../../lib/supabase/server': { supabaseServer: async () => ({ auth: { getUser: async () => ({ data: { user: { app_metadata: { plan: 'plus' } } } }) } }) },
    '../../../../lib/plus-access': { hasActivePlus },
    '../../../../lib/pdf-repair': { MAX_REPAIR_BYTES: 10_485_760, openRepairPdf },
    '../../../../lib/gemini-review': { requestGeminiReview: async options => {
      aiCalls++;
      const payload = options.payload();
      const context = JSON.parse(payload.contents[0].parts[0].text);
      assert.ok(context.editableIds.length > 0);
      const id = context.cv.find(s => s.text.startsWith('Saya membantu')).id;
      return { response: Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ revisions: [{ id, text: 'Membantu pengembangan aplikasi web perusahaan.' }] }) }] } }] }) };
    } },
    '../../../../lib/review-config': { REVIEW_TIMEOUT_MS: 180000 },
  });
  try {
    const form = new FormData();
    form.set('file', new File([fixture(m)], 'original.pdf', { type: 'application/pdf' }));
    form.set('advice', 'Perbaiki kalimat pengalaman.');
    const response = await route.POST(new Request('http://localhost/api/skor/perbaiki', { method: 'POST', body: form }));
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(aiCalls, 1);
    assert.equal(body.applied.length, 1);
    const pdf = await openRepairPdf(new Uint8Array(Buffer.from(body.pdf, 'base64')));
    try { assert.ok(pdf.segments.some(s => s.text === body.applied[0].after)); }
    finally { pdf.close(); }
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});
