require('./helpers/localization.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');

function harness(plus) {
  const states = [plus, false, '', null];
  let cursor = 0;
  const mod = { exports: {} };
  const hooks = {
    useState() { const i = cursor++; return [states[i], value => { states[i] = value; }]; },
    useRef: () => ({ current: null }), useCallback: f => f, useEffect() {},
  };
  const mocks = {
    react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: 'a' },
    '../i18n/LanguageProvider': require('./helpers/localization.cjs').mock,
    '../skor/DocumentPreview': { DocumentPreview: () => null },
    '../../lib/cv-file': { DOCX_MIME: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', isDocx: file => /\.docx$/i.test(file.name) },
    './ai-cv-repair.css': {},
  };
  const source = ts.transpileModule(fs.readFileSync('components/dashboard/AiCvRepair.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', source)(name => name in mocks ? mocks[name] : require(name), mod.exports);
  return { states, render(props) { cursor = 0; return mod.exports.AiCvRepair(props); } };
}
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
test('Basic sees an upgrade link; Plus submits the reviewed PDF and downloads the converted Word result', async () => {
  const originalFetch = global.fetch;
  const props = { file: new File(['original bytes'], 'my-cv.pdf', { type: 'application/pdf' }), review: { prioritas: [], revisi: [] } };
  try {
    const basic = walk(harness(false).render(props));
    assert.equal(basic.some(n => n.type === 'a' && n.props.href === '/harga'), true);
    assert.equal(basic.some(n => n.type === 'button'), false);
    const h = harness(true);
    let submitted;
    global.fetch = async (url, options) => {
      assert.equal(url, '/api/skor/perbaiki');
      assert.equal(options.method, 'POST');
      submitted = options.body.get('file');
      assert.equal(options.body.get('layout'), 'convert-docx');
      return Response.json({ docx: Buffer.from('converted Word bytes').toString('base64'), applied: [{ before: 'Original', after: 'Improved' }], skipped: 1, convertedFrom: 'pdf' });
    };
    const button = walk(h.render(props)).find(n => n.type === 'button');
    assert.equal(button.props.disabled, false);
    button.props.onClick();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(await submitted.text(), 'original bytes');
    assert.equal(await props.file.text(), 'original bytes');
    const result = h.states[3];
    assert.equal(result.file.name, 'my-cv-diperbaiki.docx');
    assert.equal(result.file.type, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const nodes = walk(h.render(props));
    const download = nodes.find(n => n.type === 'a' && n.props.download);
    assert.equal(download.props.download, 'my-cv-diperbaiki.docx');
    assert.ok(download.props.href.startsWith('blob:'));
    URL.revokeObjectURL(result.url);
  } finally { global.fetch = originalFetch; }
});

test('server revocation immediately removes Plus actions and shows upgrade', async () => {
  const originalFetch = global.fetch;
  const h = harness(true);
  try {
    global.fetch = async () => Response.json({ error: 'Plus required' }, { status: 403 });
    walk(h.render({ file: new File(['pdf'], 'cv.pdf'), review: {} })).find(n => n.type === 'button').props.onClick();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(h.states[0], false);
    assert.equal(h.states[3], null);
    assert.equal(h.states[1], false);
  } finally { global.fetch = originalFetch; }
});

test('DOCX repair submits the original and downloads an editable DOCX with the matching MIME type', async () => {
  const previous = global.fetch;
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const file = new File(['original docx'], 'cv.docx', { type: mime });
  const h = harness(true);
  try {
    global.fetch = async (url, options) => {
      assert.equal(await options.body.get('file').text(), 'original docx');
      return Response.json({ docx: Buffer.from('repaired docx').toString('base64'), applied: [{ before: 'Before', after: 'After' }], skipped: 0 });
    };
    const props = { file, review: { prioritas: [], revisi: [] } };
    walk(h.render(props)).find(n => n.type === 'button').props.onClick();
    await new Promise(resolve => setImmediate(resolve));
    const result = h.states[3];
    assert.equal(result.file.name, 'cv-diperbaiki.docx');
    assert.equal(result.file.type, mime);
    assert.equal(await result.file.text(), 'repaired docx');
    assert.equal(await file.text(), 'original docx');
    assert.equal(walk(h.render(props)).find(n => n.type === 'a' && n.props.download).props.download, 'cv-diperbaiki.docx');
    URL.revokeObjectURL(result.url);
  } finally { global.fetch = previous; }
});
