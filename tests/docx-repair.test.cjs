const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { zipSync, unzipSync, strToU8, strFromU8 } = require('fflate');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
function load(file, mocks = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'exports', source)(name => name in mocks ? mocks[name] : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), module.exports);
  return module.exports;
}
const { openRepairDocx } = load('lib/docx-repair.ts');
const { DOCX_MIME } = load('lib/cv-file.ts');
const ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const before = 'Saya melakukan pengelolaan 20 proyek pada 2025 untuk perusahaan.';
const after = 'Mengelola 20 proyek pada 2025 untuk perusahaan.';
function fixture() {
  return zipSync({
    '[Content_Types].xml': strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
    '_rels/.rels': strToU8('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>'),
    'word/document.xml': strToU8(`<w:document xmlns:w="${ns}"><w:body>
      <w:p><w:pPr><w:jc w:val="center"/><w:pBdr><w:bottom w:val="single" w:sz="8"/></w:pBdr></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>DAFFA WIJAYA</w:t></w:r></w:p>
      <w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">Saya melakukan </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>pengelolaan 20 proyek pada 2025 untuk perusahaan.</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">Saya memiliki </w:t></w:r><w:r><w:t>pengalaman mengelola dokumentasi proyek perusahaan.</w:t></w:r></w:p>
      <w:tbl><w:tblPr><w:tblBorders><w:bottom w:val="single"/></w:tblBorders></w:tblPr><w:tr><w:tc><w:p><w:r><w:t>Saya membantu membuat aplikasi web untuk perusahaan.</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
      <w:p><w:r><w:drawing/></w:r></w:p><w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr>
    </w:body></w:document>`),
    'word/styles.xml': strToU8('<w:styles/>'),
    'word/header1.xml': strToU8(`<w:hdr xmlns:w="${ns}"><w:p><w:r><w:t>daffa@example.com</w:t></w:r></w:p></w:hdr>`),
    'word/_rels/document.xml.rels': strToU8('<Relationships/>'),
    'word/media/image1.png': new Uint8Array([137, 80, 78, 71, 0, 5, 10]),
  });
}

test('DOCX edits split runs and table cells while retaining borders, centering, fonts and all other package parts', () => {
  const bytes = fixture();
  const doc = openRepairDocx(bytes);
  const segment = doc.segments.find(s => s.text === before);
  assert.ok(doc.editableIds.includes(segment.id));
  const mixed = doc.segments.find(s => s.text.startsWith('Saya memiliki'));
  assert.ok(!doc.editableIds.includes(mixed.id), 'mixed emphasis must be left intact');
  assert.ok(doc.text.includes('daffa@example.com'));
  const cell = doc.segments.find(s => s.text.startsWith('Saya membantu'));
  const result = doc.apply([{ id: segment.id, text: after }, { id: cell.id, text: 'Membantu membuat aplikasi web untuk perusahaan.' }]);
  assert.equal(result.applied.length, 2);
  const original = unzipSync(bytes), output = unzipSync(result.bytes);
  assert.deepEqual(Object.keys(output), Object.keys(original));
  for (const name of Object.keys(original).filter(name => name !== 'word/document.xml')) assert.deepEqual(output[name], original[name], name);
  const structure = bytes => {
    const xml = new DOMParser().parseFromString(strFromU8(bytes), 'application/xml');
    for (const node of Array.from(xml.getElementsByTagNameNS(ns, 't'))) { node.textContent = ''; node.removeAttribute('xml:space'); }
    return new XMLSerializer().serializeToString(xml);
  };
  assert.equal(structure(output['word/document.xml']), structure(original['word/document.xml']));
  const reopened = openRepairDocx(result.bytes);
  assert.ok(reopened.text.includes(after));
  assert.ok(!reopened.text.includes(before));
  assert.ok(reopened.text.includes(mixed.text));
  assert.ok(reopened.text.includes('DAFFA WIJAYA'));
  doc.close(); reopened.close();
  assert.throws(() => doc.apply([]), /ditutup/);
});

test('DOCX rejects malformed packages and unsafe revisions without silently deleting text', () => {
  assert.throws(() => openRepairDocx(new Uint8Array([1, 2, 3])));
  assert.throws(() => openRepairDocx(zipSync({ 'word/document.xml': strToU8('<xml/>') })), /valid/);
  const original = fixture();
  const doc = openRepairDocx(original);
  const segment = doc.segments.find(s => s.text === before);
  assert.throws(() => doc.apply([{ id: segment.id, text: after.replace('20', '50') }]), /aman/);
  assert.throws(() => doc.apply([{ id: segment.id, text: after.repeat(5) }]), /aman/);
  assert.throws(() => doc.apply([{ id: 'unknown', text: after }]), /sesuai/);
  assert.throws(() => doc.apply([{ id: segment.id, text: after }, { id: segment.id, text: after }]), /valid/);
  assert.throws(() => doc.apply([{ id: segment.id, text: after + '\n' + 'extra' }]), /sesuai/);
  assert.equal(doc.text.includes(before), true);
  const files = unzipSync(original);
  files['word/document.xml'] = strToU8('<!DOCTYPE x [<!ENTITY bad "bad">]><w:document/>');
  assert.throws(() => openRepairDocx(zipSync(files)), /XML/);
  files['word/document.xml'] = unzipSync(original)['word/document.xml'];
  files['word/vbaProject.bin'] = new Uint8Array([0]);
  assert.throws(() => openRepairDocx(zipSync(files)), /makro/);
  assert.throws(() => openRepairDocx(zipSync({ ...unzipSync(original), 'word/large.xml': new Uint8Array(41 * 1024 * 1024) })), /besar/);
});

test('Plus repair endpoint returns an editable DOCX with AI revisions applied to the original package', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-only';
  const route = load('app/api/skor/perbaiki/route.ts', {
    '../../../../lib/supabase/server': { supabaseServer: async () => ({ auth: { getUser: async () => ({ data: { user: {} } }) } }) },
    '../../../../lib/plus-access': { hasActivePlus: () => true },
    '../../../../lib/pdf-repair': { MAX_REPAIR_BYTES: 10 * 1024 * 1024, openRepairPdf: () => assert.fail('DOCX must not enter PDF repair') },
    '../../../../lib/docx-repair': { openRepairDocx },
    '../../../../lib/review-config': { REVIEW_TIMEOUT_MS: 180000 },
    '../../../../lib/gemini-review': { requestGeminiReview: async options => {
      const context = JSON.parse(options.payload().contents[0].parts[0].text);
      const segment = context.cv.find(s => s.text === before);
      assert.ok(context.editableIds.includes(segment.id));
      return { response: Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ revisions: [{ id: segment.id, text: after }] }) }] } }] }) };
    } },
  });
  try {
    const form = new FormData();
    form.set('file', new File([fixture()], 'cv.docx', { type: DOCX_MIME }));
    const response = await route.POST(new Request('http://localhost/api/skor/perbaiki', { method: 'POST', body: form }));
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.pdf, undefined);
    assert.equal(body.layout, 'original');
    assert.equal(body.applied.length, 1);
    assert.ok(openRepairDocx(new Uint8Array(Buffer.from(body.docx, 'base64'))).text.includes(after));
  } finally { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; }
});
