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

test('Named themes recolor the workspace and restore the current palette from storage', () => {
  const seen = new Set();
  for (const { id } of appearance.THEMES) {
    const preset = appearance.appearancePreset(id);
    assert.deepEqual(appearance.normalizeAppearance({ ...preset, background: '#FFFFFF', mode: 'system', font: 'serif' }), { ...preset, mode: 'system', font: 'serif' });
    if (id === 'default') continue;
    assert.notEqual(preset.background, '#FFFFFF');
    assert.notEqual(preset.foreground, appearance.DEFAULT_APPEARANCE.foreground);
    assert.ok(appearance.validHex(preset.background));
    assert.ok(appearance.validHex(preset.foreground));
    assert.ok(!seen.has(preset.background)); seen.add(preset.background);
    const luminance = hex => {
      const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    const bg = luminance(preset.background), fg = luminance(preset.foreground);
    assert.ok((Math.max(bg, fg) + .05) / (Math.min(bg, fg) + .05) >= 4.5, id + ' text contrast');
    const dark = appearance.appearanceTokens({ ...preset, mode: 'dark' });
    assert.notEqual(dark['--appearance-bg'], preset.background);
    assert.notEqual(dark['--dash-sidebar-gradient'], appearance.appearanceTokens(preset)['--dash-sidebar-gradient']);
  }
});

test('Background and foreground edits stay isolated by effective mode and survive persistence', () => {
  let value = appearance.appearancePreset('ocean');
  const originalDark = appearance.appearanceColors(value, true);
  value = appearance.updateAppearanceColor(value, 'background', '#FFEEDD');
  assert.equal(appearance.appearanceColors(value, false).background, '#FFEEDD');
  assert.deepEqual(appearance.appearanceColors(value, true), originalDark);
  value = appearance.updateAppearanceColor({ ...value, mode: 'system' }, 'foreground', '#CCDDEE', true);
  assert.equal(appearance.appearanceColors(value, true).foreground, '#CCDDEE');
  assert.equal(appearance.appearanceColors(value, false).foreground, '#153C50');
  value = appearance.updateAppearanceColor(value, 'foreground', '#223344', false);
  assert.equal(appearance.appearanceColors(value, false).foreground, '#223344');
  assert.equal(appearance.appearanceColors(value, true).foreground, '#CCDDEE');
  value = appearance.customizeAppearance(value, { accent: '#AABBCC' });
  const restored = appearance.normalizeAppearance(JSON.parse(JSON.stringify(value)));
  assert.deepEqual(restored, value);
  assert.equal(appearance.appearanceTokens(restored, false)['--appearance-accent'], '#AABBCC');
  assert.equal(appearance.appearanceTokens(restored, true)['--appearance-accent'], '#AABBCC');
  assert.equal(appearance.appearanceTokens(restored, true)['--appearance-bg'], originalDark.background);
  assert.equal(appearance.appearanceTokens(restored, false)['--appearance-bg'], '#FFEEDD');
});

test('Accent presets share both modes, Default follows the base theme, and Custom persists explicitly', () => {
  const ocean = appearance.appearancePreset('ocean');
  for (const option of appearance.ACCENTS) {
    const next = appearance.normalizeAppearance(appearance.updateAccent(ocean, option.id));
    assert.equal(appearance.selectedAccent(next), option.id);
    assert.equal(appearance.appearanceTokens({ ...next, mode: 'dark' })['--appearance-accent'], option.color);
    assert.equal(appearance.appearanceTokens({ ...next, mode: 'light' })['--appearance-accent'], option.color);
    assert.equal(appearance.updateAccent(next, 'default').accent, ocean.accent);
  }
  const custom = appearance.normalizeAppearance(appearance.updateAccent(ocean, 'custom'));
  assert.equal(appearance.selectedAccent(custom), 'custom');
  assert.equal(custom.accent, ocean.accent);
});
