const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(filename) {
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(name => name.endsWith('.json') ? { default: JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8')) } : name.startsWith('.') ? load(path.resolve(path.dirname(filename), name + '.ts')) : require(name), m.exports);
  return m.exports;
}
const language = load(path.resolve('lib/settings-language.ts'));
const preferences = load(path.resolve('lib/dashboard-preferences.ts'));
const storage = load(path.resolve('lib/account-storage.ts'));
test('Settings resolves browser language only when System is selected', () => {
  assert.equal(language.resolveSettingsLanguage('system', 'id-ID'), 'id');
  assert.equal(language.resolveSettingsLanguage('system', 'en-SG'), 'en');
  assert.equal(language.resolveSettingsLanguage('id', 'en-US'), 'id');
  assert.equal(language.resolveSettingsLanguage('en', 'id-ID'), 'en');
  assert.equal(language.settingsTranslator('en')('Kepadatan tampilan'), 'Display density');
  assert.equal(language.settingsTranslator('id')('Kepadatan tampilan'), 'Kepadatan tampilan');
});
test('Language preferences persist per account and preserve other settings', () => {
  const previous = global.localStorage; const items = new Map();
  global.localStorage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
  try {
    const value = { confirmLogout: true, compact: true, reduceMotion: true, language: 'en' };
    storage.writeAccountValue('lamaranku_dashboard_preferences', value, 'alice');
    assert.deepEqual(preferences.readDashboardPreferences('alice'), value);
    assert.deepEqual(preferences.readDashboardPreferences('bob'), preferences.DEFAULT_PREFERENCES);
    storage.writeAccountValue('lamaranku_dashboard_preferences', { language: 'invalid', compact: true }, 'alice');
    assert.equal(preferences.readDashboardPreferences('alice').language, 'id');
    assert.equal(preferences.readDashboardPreferences('alice').compact, true);
  } finally { global.localStorage = previous; }
});

test('Every offered language resolves region codes, translates General, and persists', () => {
  const previous = global.localStorage; const items = new Map();
  global.localStorage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
  try {
    for (const { value } of language.SETTINGS_LANGUAGES) {
      assert.equal(language.resolveSettingsLanguage('system', value + '-XX'), value);
      storage.writeAccountValue('lamaranku_dashboard_preferences', { ...preferences.DEFAULT_PREFERENCES, language: value }, 'owner');
      assert.equal(preferences.readDashboardPreferences('owner').language, value);
      const t = language.settingsTranslator(value);
      if (value !== 'id') {
        assert.notEqual(t('Kepadatan tampilan'), 'Kepadatan tampilan');
        assert.notEqual(t('Pengaturan tidak ditemukan.'), 'Pengaturan tidak ditemukan.');
      }
    }
    assert.equal(language.resolveSettingsLanguage('system', 'de-DE'), 'en');
    assert.equal(language.resolveSettingsLanguage('system', 'zh-Hans-CN'), 'zh');
    assert.equal(language.resolveSettingsLanguage('fr', 'ja-JP'), 'fr');
  } finally { global.localStorage = previous; }
});

test('App catalog covers every offered language without losing interpolation values', () => {
  const catalog = require('../lib/locales/app.json');
  for (const [key, entry] of Object.entries(catalog)) {
    for (const { value: locale } of language.SETTINGS_LANGUAGES.filter(item => item.value !== 'id')) {
      assert.equal(typeof entry[locale], 'string', key + ': ' + locale);
      assert.ok(entry[locale].trim().length > 0, key + ': empty ' + locale);
      const placeholders = text => [...text.matchAll(/\{(\d+)\}/g)].map(match => match[1]).sort();
      assert.deepEqual(placeholders(entry[locale]), placeholders(key), key + ': placeholders in ' + locale);
    }
  }
  assert.equal(language.settingsTranslator('en')('Halaman 2 dari 5'), 'Page 2 of 5');
  assert.equal(language.settingsTranslator('ja')('Halaman 2 dari 5'), '5ページ中2ページ');
  assert.equal(language.settingsTranslator('fr')('Simpan Name'), 'Enregistrer Nom');
  assert.equal(language.settingsTranslator('id')('Simpan Name'), 'Simpan Nama');
  assert.equal(language.settingsTranslator('en')('keahlian teknis'), 'Technical skills');
  assert.equal(language.settingsTranslator('id')('Settings'), 'Pengaturan');
  assert.equal(language.settingsTranslator('en')('Nama unik yang ditulis pengguna'), 'Nama unik yang ditulis pengguna');
});
