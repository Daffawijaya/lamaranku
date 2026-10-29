const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { NextRequest } = require('next/server');

function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  new Function('require', 'exports', code)(name => mocks[name] ?? require(name), exports);
  return exports;
}

test('signed-in visitors bypass login on the server; guests can still open the form', async () => {
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
  let user = { id: 'account' };
  try {
    const { middleware } = load('middleware.ts', {
      '@supabase/ssr': { createServerClient: () => ({ auth: { getUser: async () => ({ data: { user } }) } }) },
      './lib/supabase/session-policy': {},
    });
    for (const [query, destination] of [
      ['', '/dashboard'], ['?next=%2Fdashboard%2Fpengaturan', '/dashboard/pengaturan'],
      ['?next=https%3A%2F%2Fexample.org', '/dashboard'],
    ]) {
      const response = await middleware(new NextRequest(`http://localhost:3000/masuk${query}`));
      assert.equal(response.headers.get('location'), `http://localhost:3000${destination}`);
    }
    user = null;
    const response = await middleware(new NextRequest('http://localhost:3000/masuk'));
    assert.equal(response.headers.get('location'), null);
  } finally {
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
  }
});

test('client fallback automatically redirects an existing session without a Continue step', async () => {
  const oldWindow = global.window;
  global.window = { location: { search: '?next=%2Fdashboard%2Fcv-builder' } };
  const effects = [], replacements = [];
  let refreshes = 0;
  try {
    const { MasukForm } = load('components/MasukForm.tsx', {
      react: { ...React, useRef: () => ({ current: null }), useState: initial => [initial, () => {}],
        useEffect: fn => effects.push(fn), useLayoutEffect() {} },
      'next/navigation': { useRouter: () => ({ replace: destination => replacements.push(destination), refresh: () => refreshes++ }) },
      'nextjs-toploader': { useTopLoader: () => ({ start() {} }) },
      'framer-motion': { useReducedMotion: () => true, AnimatePresence: 'div', motion: { div: 'div' } },
      './i18n/LanguageProvider': { T: () => null, LocalizedAttributes: 'div' },
      '../lib/supabase/client': { supabaseBrowser: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'account' } } }) } }) },
    });
    MasukForm();
    const cleanup = effects.find(fn => fn.toString().includes('auth.getUser'))();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(replacements, ['/dashboard/cv-builder']);
    assert.equal(refreshes, 1);
    cleanup();
  } finally {
    if (oldWindow === undefined) delete global.window; else global.window = oldWindow;
  }
});
