require("./helpers/localization.cjs");
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const ts = require('typescript');
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
function profile() {
  let cursor = 0, refreshed = 0; const states = [], calls = [], uploads = [];
  const mocks = {
    react: { ...React, useEffect() {}, useRef: () => ({ current: null }), useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; } },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/navigation': { useRouter: () => ({ refresh() { refreshed++; } }) },
    'lucide-react': new Proxy({}, { get: (_, name) => name }),
    '../../lib/supabase/client': { supabaseBrowser: () => ({ storage: { from(bucket) { return { async upload(path, blob, options) { uploads.push({ bucket, path, size: blob.size, options }); return { error: null }; } }; } }, auth: { async updateUser(value) { calls.push(value); return { error: null }; } } }) },
    '../../lib/cv': { isPlus: () => false },
    './AccountContext': { useAccountId: () => 'owner', useAccountPlus: () => false },
    './DashboardData': { useDashboardData: () => ({ saved: [] }) }, './profile.css': {},
  };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('components/dashboard/ProfileWorkspace.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => name.endsWith("/i18n/LanguageProvider") ? require("./helpers/localization.cjs").mock : mocks[name], module.exports);
  const render = () => { cursor = 0; return walk(module.exports.ProfileWorkspace({ name: 'Owner', username: 'owner', avatarUrl: '', email: 'owner@example.test' })); };
  return { render, calls, uploads, refreshes: () => refreshed };
}
test('Profile updates account metadata and rejects unsupported photos before any upload', async () => {
  const view = profile();
  view.render().find(node => node.props['aria-label'] === 'Ubah Name').props.onClick();
  const form = view.render().find(node => node.type === 'form');
  await form.props.onSubmit({ preventDefault() {} });
  // Event wrapper returns void, so finish the mocked async request.
  await Promise.resolve();
  assert.deepEqual(view.calls[0], { data: { full_name: 'Owner' } });
  assert.equal(view.refreshes(), 1);
  view.render().find(node => node.type === 'input' && node.props.type === 'file').props.onChange({ target: { files: [{ type: 'image/svg+xml', size: 100 }] } });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(view.calls.length, 1);
  assert.ok(view.render().some(node => node.props.role === 'status' && node.props.children.includes('JPG')));
});
test('Profile photo uploads to the owner folder and stores only a small path in auth metadata', async () => {
  const originalDocument = global.document, originalBitmap = global.createImageBitmap;
  let closed = false; const draws = [];
  global.createImageBitmap = async () => ({ width: 800, height: 600, close() { closed = true; } });
  global.document = { createElement: () => ({ getContext: () => ({ fillRect() {}, drawImage(...args) { draws.push(args.slice(1)); } }), toDataURL: () => 'data:image/jpeg;base64,/9j/2Q==' }) };
  try {
    const view = profile();
    view.render().find(node => node.type === 'input' && node.props.type === 'file').props.onChange({ target: { files: [{ type: 'image/jpeg', size: 1024 }] } });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(closed, true);
    assert.deepEqual(draws[0], [100, 0, 600, 600, 0, 0, 256, 256]);
    assert.equal(view.uploads[0].bucket, 'profile-avatars');
    assert.equal(view.uploads[0].path, 'owner/avatar.jpg');
    assert.equal(view.uploads[0].options.upsert, true);
    assert.deepEqual(view.calls[0], { data: { avatar_path: 'owner/avatar.jpg' } });
    assert.equal(view.refreshes(), 1);
  } finally { global.document = originalDocument; global.createImageBitmap = originalBitmap; }
});
test('Email edits request an auth email change without overwriting profile metadata', async () => {
  const view = profile();
  view.render().find(node => node.props['aria-label'] === 'Ubah Email').props.onClick();
  view.render().find(node => node.type === 'input' && node.props['aria-label'] === 'Email').props.onChange({ target: { value: 'new@example.test' } });
  await view.render().find(node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  await Promise.resolve();
  assert.deepEqual(view.calls[0], { email: 'new@example.test' });
  assert.ok(view.render().some(node => node.props.role === 'status' && node.props.children.includes('konfirmasi')));
});
