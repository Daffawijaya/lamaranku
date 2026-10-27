const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const React = require("react");
const runtime = require("react/jsx-runtime");

test("A4 pagination keeps a blank first page, navigates overflow, and preserves page size when resized", () => {
  const original = { document: global.document, ResizeObserver: global.ResizeObserver };
  const nodes = {
    "cv-a4-host": { clientWidth: 397 },
    "cv-a4-paper": { offsetWidth: 794 },
    "cv-a4-flow": { clientWidth: 794, scrollWidth: 794, firstElementChild: {} },
  };
  let cursor = 0;
  let onResize;
  const values = [], effects = [], pending = [], cleanup = [];
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in values)) values[i] = initial;
      return [values[i], next => { values[i] = typeof next === "function" ? next(values[i]) : next; }];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in values)) values[i] = { current: initial };
      return values[i];
    },
    useLayoutEffect(fn, deps) {
      const i = cursor++;
      if (!effects[i] || deps.some((value, index) => value !== effects[i][index])) {
        effects[i] = deps;
        pending.push(fn);
      }
    },
  };
  const attachRefs = render => (type, props, key) => {
    if (props.ref) props.ref.current = nodes[props.className];
    return render(type, props, key);
  };
  const mocks = {
    react: hooks,
    "react/jsx-runtime": { jsx: attachRefs(runtime.jsx), jsxs: attachRefs(runtime.jsxs) },
    "lucide-react": { ChevronLeft() {}, ChevronRight() {} },
    "./CvSheet": { default() {} },
    "./cv-pagination.css": {},
  };
  const code = ts.transpileModule(fs.readFileSync("components/cv/CvPaginatedPreview.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(name => {
    assert.ok(name in mocks, `Unexpected import: ${name}`);
    return mocks[name];
  }, module, module.exports);
  const data = { templateId: "minimalist" };
  const render = () => {
    cursor = 0;
    const tree = module.exports.CvPaginatedPreview({ data, watermark: true });
    pending.splice(0).forEach(fn => cleanup.push(fn()));
    return tree;
  };
  const walk = node => React.isValidElement(node)
    ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
  const find = (tree, className) => walk(tree).find(node => node.props.className === className);
  const buttons = tree => walk(tree).filter(node => node.type === "button");
  try {
    global.document = { fonts: { ready: Promise.resolve(), addEventListener() {}, removeEventListener() {} } };
    global.ResizeObserver = class {
      constructor(callback) { onResize = callback; }
      observe() {}
      disconnect() {}
    };
    render();
    let tree = render();
    assert.equal(find(tree, "cv-a4-paper").props.style.transform, "scale(0.5)");
    assert.ok(buttons(tree).every(button => button.props.disabled));
    assert.ok(find(tree, "cv-a4-watermark"));

    nodes["cv-a4-flow"].scrollWidth = 2382;
    onResize();
    tree = render();
    assert.equal(buttons(tree)[1].props.disabled, false);
    buttons(tree)[1].props.onClick();
    tree = render();
    assert.equal(find(tree, "cv-a4-flow").props.style.transform, "translateX(-210mm)");
    buttons(tree)[1].props.onClick();
    tree = render();
    assert.equal(find(tree, "cv-a4-flow").props.style.transform, "translateX(-420mm)");
    assert.equal(buttons(tree)[1].props.disabled, true);

    nodes["cv-a4-host"].clientWidth = 198.5;
    onResize();
    tree = render();
    assert.equal(find(tree, "cv-a4-paper").props.style.transform, "scale(0.25)");
    assert.equal(find(tree, "cv-a4-flow").props.style.transform, "translateX(-420mm)");

    nodes["cv-a4-flow"].scrollWidth = 794;
    onResize();
    tree = render();
    assert.equal(find(tree, "cv-a4-flow").props.style.transform, "translateX(-0mm)");
    assert.ok(buttons(tree).every(button => button.props.disabled));
  } finally {
    cleanup.forEach(fn => fn?.());
    global.document = original.document;
    global.ResizeObserver = original.ResizeObserver;
  }
});
