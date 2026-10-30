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
  assert.equal(original.mode, "system");
  assert.deepEqual(appearance.normalizeAppearance(null), original);
  assert.equal(appearance.appearanceTokens(original)['--dash-sidebar-gradient'], undefined, 'The original 25-stop CSS gradient must remain untouched');
  assert.equal(appearance.appearanceTokens(original)['--appearance-bg'], '#FFFFFF');
  assert.equal(appearance.appearancePreset('gruvbox').accent, '#458588');
  assert.equal(appearance.appearancePreset('vercel').background, '#FFFFFF');
  assert.deepEqual(appearance.appearancePreset('default'), original);
  assert.deepEqual(appearance.DEFAULT_APPEARANCE, original, 'Preset selection cannot mutate defaults');
});
test('Appearance validates HEX values and rejects CSS injection and unknown modes', () => {
  const value = appearance.normalizeAppearance({ accent: 'red; background:url(https://example.test)', background: '#112233', foreground: '#abc', mode: 'unexpected', font: 'url(secret)' });
  assert.equal(value.accent, appearance.DEFAULT_APPEARANCE.accent);
  assert.equal(value.background, '#112233');
  assert.equal(value.foreground, appearance.DEFAULT_APPEARANCE.foreground);
  assert.equal(value.mode, 'system'); assert.equal(value.font, 'app');
  assert.equal(appearance.validHex('#aabbcc'), true); assert.equal(appearance.validHex('#abc'), false);
});
test('Dark/system modes and custom sidebar stops produce the intended tokens', () => {
  const dark = appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'dark' });
  assert.equal(dark['--appearance-bg'], '#111111'); assert.equal(dark['--appearance-fg'], '#FCFCFC');
  assert.equal(appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'system' }, true)['--appearance-bg'], '#111111');
  const custom = { ...appearance.DEFAULT_APPEARANCE, background: '#123456', foreground: '#ABCDEF', sidebarYellow: '#FFEEDD', mode: 'dark' };
  const tokens = appearance.appearanceTokens(custom);
  assert.equal(tokens['--appearance-bg'], '#123456'); assert.equal(tokens['--appearance-fg'], '#ABCDEF');
  assert.match(tokens['--dash-sidebar-gradient'], /#FFEEDD 74%/);
});
test('Appearance is persisted per account and reads malformed saved data safely', () => {
  const old = global.localStorage; const items = new Map();
  global.localStorage = { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
  try {
    const custom = appearance.appearancePreset('gruvbox');
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
    if (id !== 'vercel') assert.notEqual(preset.background, '#FFFFFF');
    assert.ok(appearance.validHex(preset.foreground));
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
    for (const mode of ['light', 'dark']) {
      const tokens = appearance.appearanceTokens({ ...preset, mode });
      assert.equal(tokens['--appearance-sidebar-overlay'], `color-mix(in srgb, ${tokens['--appearance-bg']} 66.6667%, transparent)`);
      const edited = appearance.updateAppearanceColor({ ...preset, mode }, 'background', '#123456');
      assert.equal(appearance.appearanceTokens(edited)['--appearance-sidebar-overlay'], 'color-mix(in srgb, #123456 66.6667%, transparent)');
    }
    assert.ok(appearance.validHex(dark['--appearance-bg']));
    assert.ok(dark['--dash-sidebar-gradient']);
  }
});

test('Background and foreground edits stay isolated by effective mode and survive persistence', () => {
  let value = appearance.appearancePreset('default');
  const originalDark = appearance.appearanceColors(value, true);
  value = appearance.updateAppearanceColor(value, 'background', '#FFEEDD');
  assert.equal(appearance.appearanceColors(value, false).background, '#FFEEDD');
  assert.deepEqual(appearance.appearanceColors(value, true), originalDark);
  value = appearance.updateAppearanceColor({ ...value, mode: 'system' }, 'foreground', '#CCDDEE', true);
  assert.equal(appearance.appearanceColors(value, true).foreground, '#CCDDEE');
  assert.equal(appearance.appearanceColors(value, false).foreground, '#2D2D2B');
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
  const ocean = appearance.appearancePreset('vercel');
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
test('Default dark palette uses sampled screenshot colors and a separate card surface', () => {
  const tokens = appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'dark' });
  assert.equal(tokens['--appearance-bg'], '#111111');
  assert.equal(tokens['--appearance-card'], '#1C1C1C');
  assert.equal(tokens['--appearance-fg'], '#FCFCFC');
  assert.equal(tokens['--appearance-accent'], '#0169CC');
  const light = appearance.appearanceTokens({ ...appearance.DEFAULT_APPEARANCE, mode: 'light' });
  assert.equal(light['--appearance-bg'], '#FFFFFF');
  assert.equal(light['--appearance-accent'], '#3B63FB');
});
test('Card edits are validated, isolated by mode, and persist without changing background or foreground', () => {
  let value = { ...appearance.DEFAULT_APPEARANCE, mode: 'dark' };
  value = appearance.updateAppearanceColor(value, 'card', '#334455');
  value = appearance.normalizeAppearance(JSON.parse(JSON.stringify(value)));
  assert.equal(appearance.appearanceTokens(value)['--appearance-card'], '#334455');
  assert.equal(appearance.appearanceTokens(value)['--appearance-bg'], '#111111');
  assert.equal(appearance.appearanceTokens(value)['--appearance-fg'], '#FCFCFC');
  assert.equal(appearance.appearanceTokens({ ...value, mode: 'light' })['--appearance-card'], '#FFFFFF');
  value.colorsByMode.dark.card = 'red; background:url(https://example.test)';
  assert.equal(appearance.appearanceTokens(appearance.normalizeAppearance(value))['--appearance-card'], '#1C1C1C');
});

test('Only retained and screenshot themes are offered; removed presets reset safely', () => {
  assert.deepEqual(appearance.THEMES.map(t => t.label), ['Default', 'Cyberpunk', 'Dracula', 'Everforest', 'GitHub', 'Gruvbox', 'Linear', 'Temple', 'Vercel']);
  assert.deepEqual(appearance.normalizeAppearance({ theme: 'absolutely', background: '#F9F9F7', mode: 'dark', font: 'serif' }), { ...appearance.DEFAULT_APPEARANCE, mode: 'dark', font: 'serif' });
  assert.deepEqual(appearance.normalizeAppearance({ theme: 'ocean', background: '#B9E4F0', mode: 'light' }), { ...appearance.DEFAULT_APPEARANCE, mode: 'light' });
});

test('Theme palettes retain their defined surfaces and gradients in both modes', () => {
  const refs = load(path.resolve('data/reference-themes.ts')).default;
  for (const [id, reference] of Object.entries(refs)) {
    for (const mode of ['light', 'dark']) {
      const sample = reference[mode];
      if (!sample) continue;
      const preset = { ...appearance.appearancePreset(id), mode };
      const tokens = appearance.appearanceTokens(preset);
      for (const field of ['accent', 'background', 'foreground', 'card', 'soft', 'line', 'muted']) {
        const key = field === 'background' ? 'bg' : field === 'foreground' ? 'fg' : field;
        assert.equal(tokens['--appearance-' + key], sample[field], id + ' ' + mode + ' ' + field);
      }
      assert.equal(tokens['--dash-sidebar-gradient'], sample.sidebarGradient);
      assert.equal(tokens['--appearance-sidebar-overlay'], `color-mix(in srgb, ${sample.background} 66.6667%, transparent)`);
      const edited = appearance.normalizeAppearance(appearance.updateAppearanceColor(preset, 'card', '#334455'));
      assert.equal(appearance.appearanceTokens(edited)['--appearance-card'], '#334455');
      assert.equal(appearance.appearanceTokens(edited)['--dash-sidebar-gradient'], sample.sidebarGradient);
    }
  }
  assert.equal(appearance.appearanceTokens({ ...appearance.appearancePreset('everforest'), mode: 'light' })['--appearance-accent'], '#93B259');
  assert.equal(appearance.appearanceTokens({ ...appearance.appearancePreset('everforest'), mode: 'dark' })['--appearance-accent'], '#A7C080');
});

test('Every theme has distinct readable light and dark modes, including the new companion palettes', () => {
  const refs = load(path.resolve('data/reference-themes.ts')).default;
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
  for (const { id } of appearance.THEMES) {
    if (refs[id]) { assert.ok(refs[id].light, id + ' light palette'); assert.ok(refs[id].dark, id + ' dark palette'); }
    const preset = appearance.appearancePreset(id);
    const light = appearance.appearanceTokens({ ...preset, mode: 'light' });
    const dark = appearance.appearanceTokens({ ...preset, mode: 'dark' });
    assert.ok(luminance(light['--appearance-bg']) > luminance(dark['--appearance-bg']), id + ' changes brightness');
    for (const mode of ['light', 'dark']) {
      const saved = appearance.normalizeAppearance(JSON.parse(JSON.stringify({ ...preset, mode })));
      const tokens = appearance.appearanceTokens(saved);
      assert.equal(saved.mode, mode);
      for (const surface of ['--appearance-bg', '--appearance-card']) {
        assert.ok(contrast(tokens['--appearance-fg'], tokens[surface]) >= 4.5, id + ' ' + mode + ' readable text');
      }
      assert.equal(tokens['--appearance-sidebar-overlay'], `color-mix(in srgb, ${tokens['--appearance-bg']} 66.6667%, transparent)`);
      const companion = refs[id]?.[mode];
      if (companion?.source.startsWith('Companion')) {
        assert.ok(contrast(companion.muted, companion.background) >= 4.5, id + ' companion muted text');
        assert.ok(contrast(companion.accent, companion.background) >= 4.5, id + ' companion accent');
      }
    }
  }
});
