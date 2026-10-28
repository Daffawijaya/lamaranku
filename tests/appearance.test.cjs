const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(filename) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(name => name.startsWith('.') ? load(path.resolve(path.dirname(filename), name + '.ts')) : require(name), module.exports);
  return module.exports;
}
const appearance = load(path.resolve('lib/appearance.ts'));
const storage = load(path.resolve('lib/account-storage.ts'));
test('Appearance preserves the exact default gradient and safely resets custom themes', () => {
  const original = { ...appearance.DEFAULT_APPEARANCE };
  assert.deepEqual(appearance.normalizeAppearance(null), original);
  assert.equal(appearance.appearanceTokens(original)['--dash-sidebar-gradient'], undefined, 'The original 25-stop CSS gradient must remain untouched');
  assert.equal(appearance.appearanceTokens(original)['--appearance-bg'], '#FFFFFF');
  assert.equal(appearance.appearancePreset('warm').accent, '#CC7D5E');
  assert.notEqual(appearance.appearancePreset('ocean').sidebarYellow, original.sidebarYellow);
  assert.deepEqual(appearance.appearancePreset('default'), original);
  assert.deepEqual(appearance.DEFAULT_APPEARANCE, original, 'Preset selection cannot mutate defaults');
});
test('Appearance validates HEX values and rejects CSS injection and unknown modes', () => {
  const value = appearance.normalizeAppearance({ accent: 'red; background:url(https://example.test)', background: '#112233', foreground: '#abc', mode: 'unexpected', font: 'url(secret)' });
  assert.equal(value.accent, appearance.DEFAULT_APPEARANCE.accent);
  assert.equal(value.background, '#112233');
  assert.equal(value.foreground, appearance.DEFAULT_APPEARANCE.foreground);
  assert.equal(value.mode, 'light'); assert.equal(value.font, 'app');
  assert.equal(appearance.validHex('#aabbcc'), true); assert.equal(appearance.validHex('#abc'), false);
});
test('Dark/system modes and custom sidebar stops produce the intended tokens', () => {
  const dark = appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'dark' });
  assert.equal(dark['--appearance-bg'], '#202020'); assert.equal(dark['--appearance-fg'], '#F1F1EF');
  assert.equal(appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'system' }, true)['--appearance-bg'], '#202020');
  const custom = { ...appearance.DEFAULT_APPEARANCE, background: '#123456', foreground: '#ABCDEF', sidebarYellow: '#FFEEDD', mode: 'dark' };
  const tokens = appearance.appearanceTokens(custom);
  assert.equal(tokens['--appearance-bg'], '#123456'); assert.equal(tokens['--appearance-fg'], '#ABCDEF');
  assert.match(tokens['--dash-sidebar-gradient'], /#FFEEDD 74%/);
});
test('Appearance is persisted per account and reads malformed saved data safely', () => {
  const old = global.localStorage; const items = new Map();
  global.localStorage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
  try {
    const custom = appearance.appearancePreset('warm');
    storage.writeAccountValue(appearance.APPEARANCE_KEY, custom, 'alice');
    assert.deepEqual(appearance.readAppearance('alice'), custom);
    assert.deepEqual(appearance.readAppearance('bob'), appearance.DEFAULT_APPEARANCE);
    items.set(storage.accountStorageKey(appearance.APPEARANCE_KEY, 'alice'), 'broken json');
    assert.deepEqual(appearance.readAppearance('alice'), appearance.DEFAULT_APPEARANCE);
  } finally { global.localStorage = old; }
});
