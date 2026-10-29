require('./helpers/localization.cjs');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
test('Navbar switches all desktop/mobile sign-in links to Dashboard and reacts to sign-out', () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test';
  try {
    let cursor = 0, subscribed = false, listener, cleaned = false;
    const states = [];
    const mocks = {
      react: { useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], value => states[index] = typeof value === 'function' ? value(states[index]) : value]; }, useRef: () => ({ current: null }), useEffect(fn) { if (!subscribed && fn.toString().includes('onAuthStateChange')) { subscribed = true; cleaned = fn(); } } },
      'react/jsx-runtime': require('react/jsx-runtime'),
      'next/link': { default: 'a' }, 'next/navigation': { usePathname: () => '/', useRouter: () => ({}) },
      'framer-motion': { AnimatePresence: 'div', motion: new Proxy({}, { get: (_, name) => name }) },
      'lucide-react': { ChevronDown: 'svg' }, '../../data/navigation': { navigation: [], sectionLinks: [] },
      '../../lib/supabase/client': { supabaseBrowser: () => ({ auth: { onAuthStateChange(fn) { listener = fn; return { data: { subscription: { unsubscribe() { cleaned = true; } } } }; } } }) },
      '../i18n/LanguageProvider': require('./helpers/localization.cjs').mock,
    };
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync('components/jds/SiteNavbar.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    new Function('require', 'exports', code)(name => mocks[name], module.exports);
    const render = () => { cursor = 0; return walk(module.exports.default()); };
    let nodes = render();
    assert.equal(nodes.filter(node => node.props.href === '/masuk').length, 2);
    nodes.find(node => node.props['aria-label'] === 'Buka Menu').props.onClick();
    nodes = render();
    assert.equal(nodes.filter(node => node.props.href === '/masuk').length, 4);
    listener('INITIAL_SESSION', { access_token: 'test' });
    nodes = render();
    assert.equal(nodes.filter(node => node.props.href === '/masuk').length, 0);
    assert.equal(nodes.filter(node => node.props.href === '/dashboard').length, 4);
    for (const link of nodes.filter(node => node.props.href === '/dashboard')) assert.ok(React.Children.toArray(link.props.children).includes('Dashboard'));
    listener('SIGNED_OUT', null);
    assert.equal(render().filter(node => node.props.href === '/masuk').length, 4);
    cleaned();
    assert.equal(cleaned, true);
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
  }
});
