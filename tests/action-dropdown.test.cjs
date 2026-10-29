require('./helpers/localization.cjs');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const runtime = require('react/jsx-runtime');
const ts = require('typescript');
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
test('Navbar action dropdown uses the shared popover, supports keyboard focus, and dismisses outside clicks', () => {
  const originals = { document: global.document, requestAnimationFrame: global.requestAnimationFrame, cancelAnimationFrame: global.cancelAnimationFrame };
  const listeners = new Map(), states = [], effects = [], pending = [];
  let cursor = 0, open = false;
  const trigger = { focus() { global.document.activeElement = trigger; } };
  const items = Array.from({ length: 3 }, () => ({ focus() { global.document.activeElement = this; } }));
  const menu = { querySelector: () => items[0], querySelectorAll: () => items, contains: item => items.includes(item) };
  const root = { contains: item => item === trigger || items.includes(item) };
  global.document = { activeElement: trigger, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  global.requestAnimationFrame = fn => { fn(); return 1; }; global.cancelAnimationFrame = () => {};
  const hooks = {
    useId: () => 'action-menu',
    useRef(value) { const i = cursor++; return states[i] ??= { current: value }; },
    useEffect(fn, deps) { const i = cursor++; if (!effects[i] || deps.some((v, n) => v !== effects[i].deps[n])) { const old = effects[i]; effects[i] = { deps }; pending.push(() => { old?.cleanup?.(); effects[i].cleanup = fn(); }); } },
  };
  const attach = render => (type, props, key) => { if (props.ref) props.ref.current = props.role === 'menu' ? menu : type === 'button' ? trigger : root; return render(type, props, key); };
  const module = { exports: {} };
  const mocks = { react: hooks, 'react/jsx-runtime': { jsx: attach(runtime.jsx), jsxs: attach(runtime.jsxs) }, '../i18n/LanguageProvider': require('./helpers/localization.cjs').mock, './DropdownPopover': { DropdownPopover() {} } };
  const code = ts.transpileModule(fs.readFileSync('components/ui/ActionDropdown.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'exports', code)(name => mocks[name], module.exports);
  const change = value => { open = value; };
  const render = () => { cursor = 0; const tree = module.exports.ActionDropdown({ label: 'File', open, onOpenChange: change, children: null }); pending.splice(0).forEach(fn => fn()); return tree; };
  const key = (tree, value) => tree.props.onKeyDown({ key: value, preventDefault() {}, stopPropagation() {} });
  try {
    let tree = render();
    assert.equal(walk(tree).find(node => node.props.role === 'menu').props.open, false);
    key(tree, 'ArrowDown'); tree = render();
    assert.equal(open, true); assert.equal(global.document.activeElement, items[0]);
    key(tree, 'ArrowDown'); assert.equal(global.document.activeElement, items[1]);
    key(tree, 'End'); assert.equal(global.document.activeElement, items[2]);
    key(tree, 'Escape'); tree = render();
    assert.equal(open, false); assert.equal(global.document.activeElement, trigger);
    walk(tree).find(node => node.type === 'button').props.onClick(); tree = render();
    assert.equal(open, true);
    listeners.get('pointerdown')({ target: {} }); render(); assert.equal(open, false);
  } finally { effects.forEach(effect => effect?.cleanup?.()); Object.assign(global, originals); }
});
