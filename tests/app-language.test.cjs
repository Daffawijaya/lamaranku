const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
let locale = 'en';
const cache = new Map();
function load(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename);
  if (filename.endsWith('.json')) return { default: JSON.parse(fs.readFileSync(filename, 'utf8')) };
  const isProvider = filename.endsWith('LanguageProvider.tsx');
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => {
    if (name.endsWith('.css')) return {};
    if (name === 'react' && isProvider) return { ...React, useContext: () => locale, useMemo: fn => fn() };
    if (name === 'next/link') return { default: ({ children, ...props }) => React.createElement('a', props, children) };
    if (name.endsWith('/DashboardData')) return { useDashboardData: () => ({ saved: [], query: '' }) };
    if (name.endsWith('/supabase/client')) return {};
    if (!name.startsWith('.')) return require(name);
    const resolved = path.resolve(path.dirname(filename), name);
    return load(fs.existsSync(resolved) ? resolved : fs.existsSync(resolved + '.ts') ? resolved + '.ts' : resolved + '.tsx');
  }, module.exports);
  cache.set(filename, module.exports);
  return module.exports;
}
const { DashboardHome } = load('components/dashboard/DashboardHome.tsx');
const { default: CvForm } = load('components/cv/CvForm.tsx');
const { emptyCv } = load('lib/cv.ts');
const { SETTINGS_LANGUAGES, settingsTranslator } = load('lib/settings-language.ts');
test('Dashboard headings and form labels follow all seven locales; document values remain unchanged', () => {
  for (const { value } of SETTINGS_LANGUAGES) {
    locale = value;
    const t = settingsTranslator(value);
    const home = renderToStaticMarkup(React.createElement(DashboardHome));
    assert.ok(home.includes(t('Kelola berkas')), value + ': home heading');
    assert.ok(home.includes(t('Dokumen terakhir')), value + ': document heading');
    const cv = { ...emptyCv(), nama: 'Nama', ringkasan: 'Data diri' };
    const form = renderToStaticMarkup(React.createElement(CvForm, { value: cv, onChange() {}, section: 'profile' }));
    assert.ok(form.includes(t('Nama lengkap')), value + ': form label');
    assert.ok(form.includes('value="Nama"'), value + ': name must not be translated');
    assert.ok(form.includes('>Data diri</textarea>'), value + ': summary must not be translated');
  }
});

test('Application UI text uses the shared translator; document renderers stay excluded', () => {
  const missing = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(filename); continue; }
      if (!filename.endsWith('.tsx') || /(i18n|CvSheet|Professional|StructuredData|opengraph)/.test(filename)) continue;
      const source = fs.readFileSync(filename, 'utf8');
      const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function walk(node) {
        if (ts.isJsxText(node)) {
          const text = node.getText(file).replace(/\s+/g, ' ').trim();
          let excluded = false;
          for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
            const opening = ts.isJsxElement(ancestor) ? ancestor.openingElement : ts.isJsxSelfClosingElement(ancestor) ? ancestor : null;
            if (opening && (['T', 'script', 'style'].includes(opening.tagName.getText(file)) || opening.attributes.properties.some(attr => ts.isJsxAttribute(attr) && attr.name.getText(file) === 'data-document-preview'))) excluded = true;
          }
          if (/[a-z]{2}/i.test(text) && !excluded && text !== 'LAMARANKU BASIC') missing.push(filename + ': ' + text);
        }
        ts.forEachChild(node, walk);
      }
      walk(file);
    }
  }
  scan('app'); scan('components');
  assert.deepEqual(missing, [], 'Wrap new interface copy with T so locale changes reach it');
});
