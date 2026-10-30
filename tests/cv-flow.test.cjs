const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict'), ts = require('typescript');
const { zipSync, unzipSync, strToU8, strFromU8 } = require('fflate');
function load(file) {
  const out = {};
  const source = fs.readFileSync(file, 'utf8').replace('import.meta.url', JSON.stringify(require('node:url').pathToFileURL(path.resolve(file)).href));
  new Function('require', 'exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText)(name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), out);
  return out;
}
const { flowPage } = load('lib/cv-flow.ts');
const { normalizeConvertedCv } = load('lib/pdf-to-docx.ts');
const { openRepairDocx } = load('lib/docx-repair.ts');
const block = (text, baseline, left, right, bold = false) => ({ text, id: text, kind: bold ? 'heading' : 'paragraph', layout: { left, right, baseline, top: baseline + 10, bottom: baseline - 2, size: 11, bold, font: 'Arial', color: '000000', lineHeight: 13 } });

test('flow preserves narrow date columns, makes graphical bullets editable, and keeps rules with headings', () => {
  const body = flowPage([
    block('PROJECTS', 750, 40, 130, true), block('An application for local businesses', 710, 40, 450),
    block('2026', 710, 530, 555), block('Built a useful application for local businesses.', 680, 60, 500),
  ], [{ top: 100, left: 40, width: 515, height: 1, color: '000000', id: 1 }, { top: 158, left: 50, width: 3, height: 3, relationship: 'bullet', id: 2 }], 595, 842, 40);
  assert.match(body, /<w:pBdr>/); assert.match(body, /<w:tbl>/); assert.match(body, /<w:cantSplit\/>/);
  assert.match(body, /• Built a useful application/); assert.doesNotMatch(body, /drawing|textbox|w:trHeight|w:lineRule="exact"/);
  assert.ok(Number([...body.matchAll(/<w:gridCol w:w="(\d+)"/g)].at(-1)[1]) >= 1300);
});

function pngWithRule() {
  const w = 595, h = 842, raw = Buffer.alloc(h * (w * 3 + 1), 255);
  for (let y = 0; y < h; y++) raw[y * (w * 3 + 1)] = 0;
  raw.fill(0, 100 * (w * 3 + 1) + 1 + 40 * 3, 100 * (w * 3 + 1) + 1 + 555 * 3);
  const chunk = (name, bytes) => {
    const out = Buffer.alloc(bytes.length + 12); out.writeUInt32BE(bytes.length); out.write(name, 4); out.set(bytes, 8);
    let crc = 0xffffffff;
    for (const byte of out.subarray(4, -4)) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1; }
    out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4); return out;
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(w); header.writeUInt32BE(h, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR', header),chunk('IDAT', require('node:zlib').deflateSync(raw)),chunk('IEND', Buffer.alloc(0))]);
}

test('older app DOCX is upgraded before proposal IDs are assigned; approvals survive deterministic normalization', () => {
  const original = 'Built an application to support local businesses.';
  const data = zipSync({
    '[Content_Types].xml': strToU8('<Types><Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
    '_rels/.rels': strToU8('<Relationships/>'),
    'word/_rels/document.xml.rels': strToU8('<Relationships><Relationship Id="bg1" Target="media/page1.png"/></Relationships>'),
    'word/media/page1.png': pngWithRule(),
    'word/document.xml': strToU8(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:p><w:r><w:pict><v:rect id="background1" style="width:595pt;height:842pt"><v:imagedata r:id="bg1"/></v:rect></w:pict></w:r></w:p><w:p><w:r><w:pict><v:rect id="text1" style="margin-left:40pt;margin-top:80pt;width:500pt;height:15pt"><v:textbox><w:txbxContent><w:p><w:pPr/><w:r><w:rPr><w:rFonts w:ascii="Arial"/><w:sz w:val="22"/></w:rPr><w:t>${original}</w:t></w:r></w:p></w:txbxContent></v:textbox></v:rect></w:pict></w:r></w:p></w:body></w:document>`),
  });
  const first = normalizeConvertedCv(data), second = normalizeConvertedCv(data);
  assert.deepEqual(first, second); assert.deepEqual(normalizeConvertedCv(first), first);
  const xml = strFromU8(unzipSync(first)['word/document.xml']);
  assert.doesNotMatch(xml, /v:textbox|position:absolute/); assert.match(xml, /<w:pBdr>/);
  const document = openRepairDocx(first), repeated = openRepairDocx(second);
  assert.deepEqual(document.segments, repeated.segments);
  const id = document.segments.find(s => s.text === original).id;
  const expanded = 'Built and maintained an application that supports local businesses and simplifies their daily administrative workflows. '.repeat(8);
  const result = document.apply([{ id, text: expanded }]);
  assert.equal(result.applied.length, 1); assert.ok(openRepairDocx(result.bytes).text.includes(expanded.trim()));
  const shortened = openRepairDocx(result.bytes).apply([{ id, text: 'Built an application supporting local business workflows.' }]);
  assert.equal(shortened.applied.length, 1);
});
