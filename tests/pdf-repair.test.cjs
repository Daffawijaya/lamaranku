const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { init } = require('@embedpdf/pdfium');

function load(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8').replace('import.meta.url', JSON.stringify(require('node:url').pathToFileURL(path.resolve(file)).href));
  const mod = { exports: {} };
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText)(name => name in mocks ? mocks[name] : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), mod.exports);
  return mod.exports;
}
const { hasActivePlus } = load('lib/plus-access.ts');
const { openRepairPdf, openRebuildPdf, validatePdfRevisions } = load('lib/pdf-repair.ts');
const { convertPdfToDocx } = load('lib/pdf-to-docx.ts');
const { openRepairDocx } = load('lib/docx-repair.ts');
const { unzipSync, strFromU8 } = require('fflate');

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
function fixture(m, bodyLines = ['Saya membantu membuat aplikasi website untuk perusahaan.', 'Saya melakukan pengelolaan dokumentasi proyek perusahaan.']) {
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
      text(p, bodyLines[0], 11, 48, 640);
      text(p, bodyLines[1], 11, 48, 620);
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

test('repair explains readable short text separately from a PDF without a text layer', async () => {
  const m = await engine();
  await assert.rejects(openRepairPdf(fixture(m, ['Membangun aplikasi web.', 'Mengelola data.'])), /Teks CV dapat dibaca untuk review/);
  const doc = m.FPDF_CreateNewDocument();
  let bytes;
  try {
    const page = m.FPDFPage_New(doc, 0, 595, 842);
    m.FPDFPage_GenerateContent(page);
    m.FPDF_ClosePage(page);
    bytes = save(m, doc);
  } finally { m.FPDF_CloseDocument(doc); }
  await assert.rejects(openRepairPdf(bytes), /tidak memiliki teks yang dapat diedit/);
});

test('text extraction drops terminal line endings while retaining edit eligibility', async () => {
  const m = await engine();
  const pdf = await openRepairPdf(fixture(m, ['Saya membantu membuat aplikasi website untuk perusahaan.\r\n', 'Saya melakukan pengelolaan dokumentasi proyek perusahaan.']));
  try {
    const segment = pdf.segments.find(s => s.text.startsWith('Saya membantu'));
    assert.ok(segment);
    assert.doesNotMatch(segment.text, /[\r\n]$/);
    assert.ok(pdf.editableIds.includes(segment.id));
  } finally { pdf.close(); }
});

test('AI rebuild repairs short selectable text, wraps longer revisions, and keeps unrevised content', async () => {
  const m = await engine();
  const source = fixture(m, ['Saya membuat aplikasi web.', 'Saya mengelola data proyek.']);
  await assert.rejects(openRepairPdf(source), /Teks CV dapat dibaca/);
  const pdf = await openRebuildPdf(source);
  try {
    const first = pdf.segments.find(s => s.text.startsWith('Saya membuat'));
    assert.ok(pdf.editableIds.includes(first.id));
    const after = 'Mengembangkan aplikasi web dengan struktur yang lebih rapi dan mudah dipelihara.';
    const result = await pdf.apply([{ id: first.id, text: after }]);
    assert.equal(result.applied.length, 1);
    fs.mkdirSync('tmp/pdfs', { recursive: true });
    fs.writeFileSync('tmp/pdfs/repair-rebuilt.pdf', result.bytes);
    const rebuilt = await openRebuildPdf(result.bytes);
    try {
      const text = rebuilt.segments.map(s => s.text).join(' ');
      assert.ok(text.includes(after), text);
      assert.ok(text.includes('DAFFA WIJAYA'));
      assert.ok(text.includes('daffa@example.com | Jakarta'));
      assert.ok(text.includes('React, Next.js, TypeScript'));
    } finally { rebuilt.close(); }
  } finally { pdf.close(); }
});

test('rebuild skips a factual change but still downloads safe edits with the original facts', async () => {
  const m = await engine();
  const pdf = await openRebuildPdf(fixture(m, ['Saya mengelola 20 proyek pada 2025.', 'Saya melakukan pengelolaan dokumentasi proyek perusahaan.']));
  try {
    const numbered = pdf.segments.find(s => s.text.startsWith('Saya mengelola 20'));
    const safe = pdf.segments.find(s => s.text.startsWith('Saya melakukan'));
    const unsafe = { id: numbered.id, text: 'Saya mengelola 50 proyek pada 2025.' };
    await assert.rejects(pdf.apply([unsafe]), /Semua revisi AI mengubah angka/);
    const result = await pdf.apply([unsafe, { id: safe.id, text: 'Mengelola dokumentasi proyek perusahaan.' }]);
    assert.equal(result.applied.length, 1);
    assert.equal(result.skipped, 1);
    const output = await openRebuildPdf(result.bytes);
    try {
      const text = output.segments.map(s => s.text).join(' ');
      assert.ok(text.includes('20 proyek pada 2025.'));
      assert.ok(!text.includes('50 proyek'));
      assert.ok(text.includes('Mengelola dokumentasi proyek perusahaan.'));
      assert.ok(text.includes('daffa@example.com'));
    } finally { output.close(); }
    assert.throws(() => validatePdfRevisions([unsafe, unsafe], pdf.segments, true), /Revisi AI tidak sesuai/);
  } finally { pdf.close(); }
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

test('paid repair API automatically converts PDFs to Word before AI revision, including older client layout values', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key-no-network';
  const m = await engine();
  let aiCalls = 0;
  const route = load('app/api/skor/perbaiki/route.ts', {
    '../../../../lib/supabase/server': { supabaseServer: async () => ({ auth: { getUser: async () => ({ data: { user: { app_metadata: { plan: 'plus' } } } }) } }) },
    '../../../../lib/plus-access': { hasActivePlus },
    '../../../../lib/pdf-repair': { MAX_REPAIR_BYTES: 10_485_760, openRepairPdf, openRebuildPdf },
    '../../../../lib/gemini-review': { requestGeminiReview: async options => {
      aiCalls++;
      const payload = options.payload();
      const context = JSON.parse(payload.contents[0].parts[0].text);
      assert.ok(context.editableIds.length > 0);
      const id = context.cv.find(s => s.text.startsWith('Saya membantu')).id;
      return { response: Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ revisions: context.editableIds.map(target => ({ id: target, text: target === id ? 'Membantu pengembangan aplikasi web perusahaan.' : context.cv.find(s => s.id === target).text })) }) }] } }] }) };
    } },
    '../../../../lib/review-config': { REVIEW_TIMEOUT_MS: 180000 },
  });
  try {
    for (const rebuild of [false, true]) {
    const form = new FormData();
    form.set('layout', rebuild ? 'rebuild' : 'original');
    form.set('file', new File([fixture(m)], 'original.pdf', { type: 'application/pdf' }));
    form.set('advice', 'Perbaiki kalimat pengalaman.');
    const response = await route.POST(new Request('http://localhost/api/skor/perbaiki', { method: 'POST', body: form }));
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(aiCalls, rebuild ? 2 : 1);
      assert.equal(body.layout, 'converted');
      assert.equal(body.convertedFrom, 'pdf');
      assert.equal(body.pdf, undefined);
    assert.equal(body.applied.length, 1);
    const pdf = openRepairDocx(new Uint8Array(Buffer.from(body.docx, 'base64')));
    try { assert.ok(pdf.segments.some(s => s.text === body.applied[0].after)); }
    finally { pdf.close(); }
    }
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});

test('PDF conversion handles short text objects, retains visual lines, and removes source wording from the background', async () => {
  const m = await engine();
  const original = fixture(m, ['Saya membuat aplikasi web.', 'Saya mengelola data proyek.']);
  await assert.rejects(openRepairPdf(original), /Teks CV dapat dibaca/);
  const bytes = await convertPdfToDocx(original);
  const word = openRepairDocx(bytes);
  const first = word.segments.find(s => s.text === 'Saya membuat aplikasi web.');
  assert.ok(first);
  assert.ok(word.editableIds.includes(first.id));
  const result = word.apply([{ id: first.id, text: 'Membangun aplikasi web.' }]);
  const reopened = openRepairDocx(result.bytes);
  assert.ok(reopened.text.includes('Membangun aplikasi web.'));
  assert.ok(reopened.text.includes('Saya mengelola data proyek.'));
  assert.ok(reopened.text.includes('DAFFA WIJAYA'));
  const files = unzipSync(result.bytes);
  const xml = strFromU8(files['word/document.xml']);
  assert.equal((xml.match(/id="background/g) ?? []).length, 2);
  assert.equal((xml.match(/<w:pgSz w:w="11900" w:h="16840"/g) ?? []).length, 2);
  assert.ok(xml.includes('<v:textbox'), 'text is editable Word content');
  const png = Buffer.from(files['word/media/page1.png']);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const chunks = [];
  for (let i = 8; i < png.length;) {
    const size = png.readUInt32BE(i), type = png.toString('ascii', i + 4, i + 8);
    if (type === 'IDAT') chunks.push(png.subarray(i + 8, i + 8 + size));
    i += size + 12;
  }
  const rows = require('node:zlib').inflateSync(Buffer.concat(chunks));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  let blue = 0, dark = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * (width * 3 + 1) + 1 + x * 3;
    if (rows[i] < 100 && rows[i + 1] > 70 && rows[i + 2] > 180) blue++;
    if (rows[i] < 80 && rows[i + 1] < 80 && rows[i + 2] < 80) dark++;
  }
  assert.ok(blue > 500, 'decorative blue rule must survive conversion');
  assert.equal(dark, 0, 'old text must not remain burned into the background');
  fs.mkdirSync('tmp/pdfs', { recursive: true });
  fs.writeFileSync('tmp/pdfs/converted-repaired.docx', result.bytes);
  word.close(); reopened.close();
});

test('PDF conversion reads text nested inside Form XObjects instead of rejecting the document', async () => {
  const m = await engine();
  const source = fixture(m, ['Saya membuat aplikasi web.', 'Saya mengelola data proyek.']);
  const ptr = m.pdfium.wasmExports.malloc(source.length);
  m.pdfium.HEAPU8.set(source, ptr);
  const original = m.FPDF_LoadMemDocument(ptr, source.length, '');
  const doc = m.FPDF_CreateNewDocument();
  let bytes;
  try {
    const page = m.FPDFPage_New(doc, 0, 595, 842);
    const xobject = m.FPDF_NewXObjectFromPage(doc, original, 0);
    assert.ok(xobject);
    const form = m.FPDF_NewFormObjectFromXObject(xobject);
    assert.ok(form);
    m.FPDFPage_InsertObject(page, form);
    assert.equal(m.FPDFPage_GenerateContent(page), true);
    m.FPDF_ClosePage(page);
    m.FPDF_CloseXObject(xobject);
    bytes = save(m, doc);
  } finally { m.FPDF_CloseDocument(doc); m.FPDF_CloseDocument(original); m.pdfium.wasmExports.free(ptr); }
  await assert.rejects(openRepairPdf(bytes), /Teks CV dapat dibaca/);
  const word = openRepairDocx(await convertPdfToDocx(bytes));
  try {
    const segment = word.segments.find(s => s.text === 'Saya membuat aplikasi web.');
    assert.ok(segment);
    assert.ok(word.editableIds.includes(segment.id));
    assert.equal(word.apply([{ id: segment.id, text: 'Membangun aplikasi web.' }]).applied.length, 1);
  } finally { word.close(); }
});

test('Word conversion applies font transforms and normalizes a nonzero PDF crop origin', async () => {
  const m = await engine();
  const doc = m.FPDF_CreateNewDocument();
  const ptr = m.pdfium.wasmExports.malloc(512);
  let bytes;
  try {
    const page = m.FPDFPage_New(doc, 0, 595, 842);
    m.FPDFPage_SetMediaBox(page, 0, 8, 595, 850);
    m.FPDFPage_SetCropBox(page, 0, 8, 595, 850);
    const object = m.FPDFPageObj_NewTextObj(doc, 'Helvetica', 16);
    m.pdfium.stringToUTF16('A developer creating reliable applications.', ptr, 512);
    assert.ok(m.FPDFText_SetText(object, ptr));
    m.FPDFPageObj_Transform(object, .75, 0, 0, .75, 48, 700);
    m.FPDFPage_InsertObject(page, object);
    assert.ok(m.FPDFPage_GenerateContent(page));
    m.FPDF_ClosePage(page);
    bytes = save(m, doc);
  } finally { m.pdfium.wasmExports.free(ptr); m.FPDF_CloseDocument(doc); }
  const files = unzipSync(await convertPdfToDocx(bytes));
  const xml = strFromU8(files['word/document.xml']);
  assert.ok(xml.includes('<w:sz w:val="24"/>'), '16pt scaled by .75 must become 12pt in Word');
  assert.ok(xml.includes('margin-top:139.20pt'), 'crop origin must be subtracted from the PDF baseline');
});
