require("./helpers/localization.cjs");
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');
function render(section) {
  const mocks = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/navigation': { useSearchParams: () => new URLSearchParams(section ? { section } : {}) },
    'lucide-react': require('lucide-react'),
    './AccountContext': { useAccountId: () => 'owner' },
    './AppearanceSettings': { AppearanceSettings: () => React.createElement('div', { 'data-appearance': true }) },
    '../../lib/appearance': { DEFAULT_APPEARANCE: {} },
    './ProfileWorkspace': { ProfileWorkspace: () => React.createElement('div', { 'data-profile': true }) },
    '../../lib/account-storage': {}, '../../lib/cv': {},
    '../../lib/dashboard-preferences': { DEFAULT_PREFERENCES: { compact: false, confirmLogout: false } },
    '../../lib/settings-language': { SETTINGS_LANGUAGES: [{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }], resolveSettingsLanguage: () => 'id', settingsTranslator: () => text => text },
    '../ui/Dropdown': { Dropdown: ({ label, options, value }) => React.createElement('select', { 'aria-label': label, defaultValue: value }, options.map(option => React.createElement('option', { key: option.value, value: option.value }, option.label))) },
    './settings.css': {},
  };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('components/dashboard/SettingsWorkspace.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => name.endsWith("/i18n/LanguageProvider") ? require("./helpers/localization.cjs").mock : mocks[name], module.exports);
  return renderToStaticMarkup(React.createElement(module.exports.SettingsWorkspace, { name: 'Owner', email: 'owner@example.test' }));
}
test('Settings renders the URL section on the server, before hydration or effects', () => {
  const profile = render('profile');
  assert.match(profile, /data-profile="true"/);
  assert.doesNotMatch(profile, /<h2>General<\/h2>/);
  assert.match(render('appearance'), /data-appearance="true"/);
  assert.match(render('account'), /data-profile="true"/);
  assert.match(render('unknown'), /<h2>General<\/h2>/);
  assert.match(render(), /<h2>General<\/h2>/);
});
