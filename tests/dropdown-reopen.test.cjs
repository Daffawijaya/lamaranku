const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const ts = require('typescript');

test('An opened dropdown retains one portal surface through close/reopen instead of racing an exiting surface', () => {
  const previousDocument = global.document;
  global.document = { body: {} };
  const states = [], effects = [];
  let cursor = 0, dirty = false;
  const hooks = {
    ...React,
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], next => { if (states[i] !== next) { states[i] = next; dirty = true; } }]; },
    useEffect(fn, deps) { const i = cursor++; if (!effects[i] || effects[i].some((value, index) => value !== deps[index])) { effects[i] = deps; fn(); } },
  };
  const mocks = {
    react: hooks,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'react-dom': { createPortal: child => ({ child }) },
    'framer-motion': { motion: { div: 'div' } },
    './dropdown.css': {},
  };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('components/ui/DropdownPopover.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => mocks[name], module.exports);
  const render = open => {
    let value;
    do { dirty = false; cursor = 0; value = module.exports.DropdownPopover.render({ open, portal: true, children: 'options' }, null); } while (dirty);
    return value.child;
  };
  try {
    assert.equal(render(false), null, 'Do not mount menu items before first use');
    const first = render(true);
    assert.ok(React.isValidElement(first));
    for (let index = 0; index < 20; index++) {
      const closed = render(false);
      assert.equal(closed.type, first.type);
      assert.equal(closed.props.open, false);
      const reopened = render(true);
      assert.equal(reopened.type, first.type);
      assert.equal(reopened.key, first.key);
      assert.equal(reopened.props.open, true);
    }
  } finally { global.document = previousDocument; }
});

test('Profile trigger waits for hydration before accepting clicks', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  let ready = false, cursor = 0;
  const module = { exports: {} };
  const mocks = {
    react: { ...React, useState(initial) { return [cursor++ === 0 ? ready : initial, () => {}]; }, useLayoutEffect() {} },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '../i18n/LanguageProvider': { T: ({ text }) => text, LocalizedAttributes: ({ children }) => children },
    'next/link': { default: ({ children }) => React.createElement('a', null, children) },
    '../ui/DropdownPopover': { DropdownPopover: () => null },
    'lucide-react': new Proxy({}, { get: () => () => null }),
    './profile-menu.css': {},
  };
  const code = ts.transpileModule(fs.readFileSync('components/dashboard/ProfileMenu.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => mocks[name], module.exports);
  const render = () => { cursor = 0; return renderToStaticMarkup(React.createElement(module.exports.ProfileMenu, { name: 'Owner', email: 'owner@example.test', plus: false, busy: false, route: '/dashboard', avatar: null, onLogout() {} })); };
  assert.match(render(), /disabled=""/);
  assert.match(render(), /aria-busy="true"/);
  ready = true;
  assert.doesNotMatch(render(), /disabled=""/);
  assert.match(render(), /aria-busy="false"/);
});
