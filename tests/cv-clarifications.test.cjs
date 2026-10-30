require('./helpers/localization.cjs');
const fs = require('node:fs'), test = require('node:test'), assert = require('node:assert/strict'), ts = require('typescript');
const moduleExports = {};
new Function('exports', ts.transpileModule(fs.readFileSync('lib/cv-clarifications.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(moduleExports);
const { validateCvQuestions, validateCvAnswers, preservesConfirmedFacts } = moduleExports;
const question = { id: 'q1', segmentId: 'p1', question: 'Berapa pengguna aplikasi tersebut?' };

test('clarifications target editable paragraphs and skipped answers add no facts', () => {
  assert.deepEqual(validateCvAnswers([{ ...question, answer: ' ' }], ['p1']), []);
  assert.deepEqual(validateCvAnswers([{ ...question, answer: ' 30 pengguna ' }], ['p1']), [{ ...question, answer: '30 pengguna' }]);
  assert.throws(() => validateCvQuestions([question], ['p2']));
  assert.throws(() => validateCvQuestions([question, question], ['p1']));
  assert.throws(() => validateCvAnswers([{ ...question, answer: 'a'.repeat(1001) }], ['p1']));
});
test('new metrics need explicit matching confirmation and original facts remain unchanged', () => {
  const before = 'Mengelola 20 proyek pada 2025.';
  const after = 'Mengelola 20 proyek pada 2025 untuk 30 pengguna.';
  assert.equal(preservesConfirmedFacts(before, after), false);
  assert.equal(preservesConfirmedFacts(before, after, ['30 pengguna']), true);
  assert.equal(preservesConfirmedFacts(before, after, ['']), false);
  assert.equal(preservesConfirmedFacts(before, 'Mengelola 30 proyek pada 2025.', ['30 proyek']), false);
  assert.equal(preservesConfirmedFacts(before, after.replace('30 pengguna', '30%'), ['30 pengguna']), false);
  assert.equal(preservesConfirmedFacts(before, 'Mengelola 20 proyek pada 2025, mengurangi waktu 30%.', ['Berkurang 30%']), true);
});

test('dialog supports back navigation, answering and skipping without inventing defaults', () => {
  let cursor = 0, states = [], completed;
  const hooks = { useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], value => { states[index] = value; }]; } };
  const mod = { exports: {} };
  const mocks = { react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'), '../ui/ConfirmModal': { ConfirmModal: () => null }, '../i18n/LanguageProvider': require('./helpers/localization.cjs').mock, './cv-clarification.css': {} };
  new Function('require', 'exports', ts.transpileModule(fs.readFileSync('components/dashboard/CvClarificationDialog.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText)(name => mocks[name], mod.exports);
  const React = require('react');
  const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
  const questions = [question, { ...question, id: 'q2', segmentId: 'p2' }];
  const render = () => { cursor = 0; return mod.exports.CvClarificationDialog({ questions, onComplete: answers => { completed = answers; }, onClose() {} }); };
  let view = render();
  walk(view).find(n => n.type === 'textarea').props.onChange({ target: { value: '30 pengguna' } });
  view = render(); view.props.onConfirm();
  view = render();
  assert.equal(completed, undefined, 'must wait until all questions are visited');
  walk(view.props.footerStart).find(n => n.type === 'button' && n.props.children === 'Kembali').props.onClick();
  view = render();
  assert.equal(walk(view).find(n => n.type === 'textarea').props.value, '30 pengguna');
  view.props.onConfirm(); view = render();
  assert.equal(view.props.cancelLabel, 'Tidak tahu / Lewati');
  view.props.onCancelAction();
  assert.deepEqual(completed, [{ ...question, answer: '30 pengguna' }]);
});
