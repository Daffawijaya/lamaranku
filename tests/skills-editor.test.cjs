const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const ts = require("typescript");
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];

function editor(initial, separator = "\n") {
  let cursor = 0, value = initial, focus = 0;
  const states = [];
  const mocks = {
    react: {
      useId: () => "skill-input",
      useRef: () => ({ current: { focus() { focus++; } } }),
      useState: initial => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], next => { states[i] = next; }]; },
    },
    "react/jsx-runtime": require("react/jsx-runtime"),
    "lucide-react": { Plus() {}, X() {} },
    "./skills-editor.css": {},
  };
  const { outputText } = ts.transpileModule(fs.readFileSync("components/cv/SkillsEditor.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const module = { exports: {} };
  new Function("require", "exports", outputText)(name => mocks[name], module.exports);
  const render = () => { cursor = 0; return module.exports.SkillsEditor({ label: "Keahlian teknis", value, onChange: next => { value = next; }, separator, placeholder: "Contoh: React" }); };
  const input = () => walk(render()).find(node => node.type === "input");
  const add = () => walk(render()).find(node => node.type === "button" && node.props["aria-label"] === "Tambah keahlian teknis");
  return { render, input, add, value: () => value, focused: () => focus };
}

test("skills add by button or Enter, reject duplicates, and remove one item without losing others", () => {
  const h = editor("JavaScript\nReact");
  assert.equal(h.add().props.disabled, true);
  h.input().props.onChange({ target: { value: " TypeScript " } });
  h.add().props.onClick();
  assert.equal(h.value(), "JavaScript\nReact\nTypeScript");
  assert.equal(h.input().props.value, "");
  h.input().props.onChange({ target: { value: "react" } });
  h.add().props.onClick();
  assert.equal(h.value(), "JavaScript\nReact\nTypeScript");
  assert.ok(walk(h.render()).some(node => node.props.role === "status"));
  h.input().props.onChange({ target: { value: "SQL" } });
  let prevented = false;
  h.input().props.onKeyDown({ key: "Enter", nativeEvent: { isComposing: false }, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(h.value(), "JavaScript\nReact\nTypeScript\nSQL");
  walk(h.render()).find(node => node.props["aria-label"] === "Hapus React dari keahlian teknis").props.onClick();
  assert.equal(h.value(), "JavaScript\nTypeScript\nSQL");
  assert.ok(h.focused() >= 4);
});

test("legacy comma skills and multiline technical groups preserve their saved format", () => {
  const legacy = editor("Excel, Komunikasi", ", ");
  legacy.input().props.onChange({ target: { value: "Analisis data" } });
  legacy.add().props.onClick();
  assert.equal(legacy.value(), "Excel, Komunikasi, Analisis data");
  const grouped = editor("Frontend: React, Vue\nDatabase: SQL, PostgreSQL");
  assert.equal(walk(grouped.render()).filter(node => node.type === "li").length, 2);
  grouped.input().props.onChange({ target: { value: "Backend: Node.js" } });
  grouped.add().props.onClick();
  assert.equal(grouped.value(), "Frontend: React, Vue\nDatabase: SQL, PostgreSQL\nBackend: Node.js");
});
