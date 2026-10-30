const fs = require('node:fs'), path = require('node:path'), test = require('node:test'), assert = require('node:assert/strict');
const React = require('react'), ts = require('typescript');
function load(file) {
  const out = {};
  const mocks = {
    react: { ...React, useState: () => ['', () => {}], useEffect() {} },
    '../ui/Dropdown': { Dropdown: () => null },
    '../i18n/LanguageProvider': { T: () => null, LocalizedAttributes: ({ children }) => children },
    './appearance.css': {},
  };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'exports', code)(name => name in mocks ? mocks[name] : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name), out);
  return out;
}
const { AppearanceSettings } = load('components/dashboard/AppearanceSettings.tsx');
const { THEMES, appearancePreset, normalizeAppearance } = load('lib/appearance.ts');
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];

test('theme dropdown keeps the selected mode and font for every theme and sorts Default first, Custom last', () => {
  for (const mode of ['system', 'light', 'dark']) {
    let value = { ...appearancePreset('github'), mode, font: 'serif' };
    for (const theme of [...THEMES.map(item => item.id), 'custom']) {
      const root = AppearanceSettings({ value, onChange: next => { value = next; } });
      const component = walk(root).find(node => node.type.name === 'ThemeDropdown');
      const dropdown = walk(component.type(component.props)).find(node => node.props.label === 'Theme' && node.props.options);
      assert.deepEqual(dropdown.props.options.map(option => option.label), ['Default', 'Cyberpunk', 'Dracula', 'Everforest', 'GitHub', 'Gruvbox', 'Linear', 'Temple', 'Vercel', 'Custom']);
      dropdown.props.onChange(theme);
      assert.equal(value.theme, theme);
      assert.equal(value.mode, mode, theme + ' must preserve ' + mode);
      assert.equal(value.font, 'serif');
      assert.equal(normalizeAppearance(JSON.parse(JSON.stringify(value))).mode, mode);
    }
  }
});
