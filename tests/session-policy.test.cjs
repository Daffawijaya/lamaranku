const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const ssr = require('@supabase/ssr');

function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'exports', code)(name => mocks[name] ?? require(name), exports);
  return exports;
}

const policy = load('lib/supabase/session-policy.ts');
const { createStorageFromOptions, applyServerStorage } = require(path.join(
  path.dirname(require.resolve('@supabase/ssr')), 'cookies.js',
));

test('actual SDK browser cookie writes roll forward 30 days on refresh and clear on logout', async () => {
  const previousDocument = global.document;
  let options, now = 0;
  const jar = new Map();
  global.document = {
    get cookie() { return [...jar].filter(([, item]) => item.expires > now).map(([name, item]) => `${name}=${item.value}`).join('; '); },
    set cookie(serialized) {
      const [pair] = serialized.split(';');
      const [name, ...value] = pair.split('=');
      const maxAge = Number(/Max-Age=(-?\d+)/i.exec(serialized)[1]);
      jar.set(name, { value: value.join('='), expires: now + maxAge });
    },
  };
  try {
    load('lib/supabase/client.ts', {
      '@supabase/ssr': { ...ssr, createBrowserClient(_url, _key, config) { options = config; } },
      './session-policy': policy,
    }).supabaseBrowser();
    assert.equal(options.cookies.encode, 'tokens-only');
    assert.equal(options.auth.persistSession, true);
    assert.equal(options.auth.autoRefreshToken, true);
    const { storage } = createStorageFromOptions({ ...options, cookieEncoding: 'base64url' }, false);
    const key = 'sb-example-auth-token';
    await storage.setItem(key, JSON.stringify({ access_token: 'initial', refresh_token: 'initial' }));
    assert.equal(jar.get(key).expires, 2592000);
    now = 29 * 86400;
    await storage.setItem(key, JSON.stringify({ access_token: 'refreshed', refresh_token: 'rotated' }));
    assert.equal(jar.get(key).expires, now + 2592000);
    now = 31 * 86400;
    assert.ok(await storage.getItem(key), 'active session outlives the original 30-day period');
    now = 59 * 86400;
    assert.equal(await storage.getItem(key), null, 'cookie disappears after 30 days without a refresh');
    await storage.setItem(key, JSON.stringify({ access_token: 'new', refresh_token: 'new' }));
    await storage.removeItem(key);
    assert.equal(await storage.getItem(key), null, 'logout still removes cookies immediately');
  } finally {
    if (previousDocument === undefined) delete global.document; else global.document = previousDocument;
  }
});

test('server token refresh also writes a 30-day lifetime and retains immediate cookie deletion', async () => {
  let options;
  const written = [];
  const store = { getAll: () => [], set: (name, value, options) => written.push({ name, value, options }) };
  await load('lib/supabase/server.ts', {
    '@supabase/ssr': { createServerClient(_url, _key, config) { options = config; } },
    'next/headers': { cookies: async () => store }, './session-policy': policy,
  }).supabaseServer();
  const settings = { ...options, cookieEncoding: 'base64url' };
  const storage = createStorageFromOptions(settings, true);
  await storage.storage.setItem('sb-example-auth-token', JSON.stringify({ access_token: 'new' }));
  await applyServerStorage(storage, settings);
  assert.ok(written.length);
  assert.ok(written.every(cookie => cookie.options.maxAge === 2592000));
  options.cookies.setAll([{ name: 'sb-example-auth-token', value: '', options: { maxAge: 0, path: '/' } }]);
  assert.equal(written.at(-1).options.maxAge, 0);
});

test('cookie policy preserves scope and does not resurrect removed token chunks', () => {
  assert.deepEqual(policy.sessionCookieOptions({ path: '/', sameSite: 'lax', secure: true, maxAge: 34560000 }),
    { path: '/', sameSite: 'lax', secure: true, maxAge: 2592000 });
  assert.deepEqual(policy.sessionCookieOptions({ maxAge: -1 }), { maxAge: -1 });
});
