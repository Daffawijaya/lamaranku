const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const mod = { exports: {} };
new Function('require', 'exports', ts.transpileModule(fs.readFileSync('lib/pdf-layout.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(require, mod.exports);
const { pdfReadingOrder } = mod.exports;
const line = (text, y, { left = 45, size = 11, bold = false } = {}) => [...text].map((text, i) => ({ text, left: left + i * 5, right: left + i * 5 + 4, baseline: y, size, bold }));

test('Word conversion separates right-aligned dates and preserves actual bullet glyphs', () => {
  const blocks = pdfReadingOrder([
    ...line('EXAMPLE ORGANIZATION', 700, { bold: true }),
    ...line('2025 - Present', 700, { left: 480 }),
    ...line('• Developed reliable web applications.', 670, { left: 55 }),
  ], 0, 595, true);
  assert.equal(blocks[0].text, 'EXAMPLE ORGANIZATION');
  assert.equal(blocks[1].text, '2025 - Present');
  assert.ok(blocks[2].text.startsWith('• '));
});

test('reading order follows visual positions even when the PDF stream draws descriptions first', () => {
  const blocks = pdfReadingOrder([
    ...line('Developed a web application.', 600),
    ...line('WORK EXPERIENCE', 670, { bold: true, size: 14 }),
    ...line('Frontend Developer', 630, { bold: true }),
    ...line('DAFA WIJAYA', 780, { bold: true, size: 24 }),
    ...line('PROFESSIONAL SUMMARY', 730, { bold: true, size: 14 }),
    ...line('A developer creating web applications.', 700),
  ], 0, 595);
  assert.deepEqual(blocks.map(b => b.text), ['DAFA WIJAYA', 'PROFESSIONAL SUMMARY', 'A developer creating web applications.', 'WORK EXPERIENCE', 'Frontend Developer', 'Developed a web application.']);
  assert.equal(blocks[0].kind, 'title');
  assert.equal(blocks[1].kind, 'heading');
  assert.equal(blocks[4].kind, 'subheading');
});

test('wrapped paragraphs become one AI target without merging adjacent bullets or certificates', () => {
  const blocks = pdfReadingOrder([
    ...line('WORK EXPERIENCE', 730, { bold: true, size: 14 }),
    ...line('Built a full-stack web-', 700, { left: 64 }),
    ...line('based catalog for businesses.', 685, { left: 64 }),
    ...line('Maintained the internal application.', 670, { left: 64 }),
    ...line('CERTIFICATIONS', 640, { bold: true, size: 14 }),
    ...line('AWS Academy Graduate | 2022', 610, { left: 64 }),
    ...line('IC3 Digital Literacy | 2019', 595, { left: 64 }),
  ], 1, 595);
  assert.equal(blocks[1].text, 'Built a full-stack web-based catalog for businesses.');
  assert.equal(blocks[1].kind, 'bullet');
  assert.equal(blocks[2].text, 'Maintained the internal application.');
  assert.equal(blocks[4].text, 'AWS Academy Graduate | 2022');
  assert.equal(blocks[5].text, 'IC3 Digital Literacy | 2019');
  assert.equal(blocks[4].kind, 'metadata');
});
