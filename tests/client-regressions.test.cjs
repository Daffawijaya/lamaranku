const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");

// Exercise editor handlers without a browser or another test dependency.
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(outputText, filename);
  };
}
const { DEFAULT_CV, cloneCv, loadSaved, storeSaved, CV_STORAGE_KEY } = require("../lib/cv.ts");
const CvForm = require("../components/cv/CvForm.tsx").default;

function harness(filename, mocks = {}) {
  let cursor = 0;
  const states = [], effects = [], pending = [];
  const hooks = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = initial;
      return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!effects[i] || deps.some((dep, index) => !Object.is(dep, effects[i][index]))) {
        effects[i] = deps;
        pending.push(fn);
      }
    },
  };
  const fullPath = path.resolve(__dirname, "..", filename);
  const { outputText } = ts.transpileModule(fs.readFileSync(fullPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(name => {
    if (name === "react") return hooks;
    if (name in mocks) return mocks[name];
    return require(name.startsWith(".") ? path.resolve(path.dirname(fullPath), name) : name);
  }, module, module.exports);
  return component => {
    cursor = 0;
    const result = component(module.exports);
    pending.splice(0).forEach(fn => fn());
    return result;
  };
}

function descendants(element) {
  if (!React.isValidElement(element)) return [];
  return [element, ...React.Children.toArray(element.props.children).flatMap(descendants)];
}

test("CV and portfolio edits preserve input identity, saved data, and failure notices", () => {
  const originalStorage = global.localStorage;
  const storage = new Map();
  let blocked = false;
  global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem(key, value) { if (blocked) throw new Error("QuotaExceededError"); storage.set(key, value); },
  };
  try {
    const entry = { id: "one", judul: "CV pertama", updatedAt: "25 Okt 2026", data: cloneCv(DEFAULT_CV) };
    storeSaved([entry]);
    const malformed = { ...entry, data: { ...entry.data, pengalaman: [null] } };
    storage.set(CV_STORAGE_KEY, JSON.stringify([entry, malformed]));
    assert.deepEqual(loadSaved(), [entry]);
    blocked = true;
    assert.throws(() => storeSaved([]), /belum tersimpan/);
    assert.deepEqual(loadSaved(), [entry]);
    blocked = false;

    for (const [section, array, field] of [["experience", "pengalaman", "jabatan"], ["education", "pendidikan", "gelar"]]) {
      const before = CvForm({ value: entry.data, onChange() {}, section });
      const changed = cloneCv(entry.data);
      changed[array][0][field] += " diubah";
      const after = CvForm({ value: changed, onChange() {}, section });
      const keys = tree => descendants(tree).filter(node => node.type === "div" && node.key !== null).map(node => node.key);
      assert.deepEqual(keys(after), keys(before), "Typing must not remount a form row");
    }

    let params = new URLSearchParams("cv=one");
    const render = harness("app/cv-builder/isi/IsiClient.tsx", {
      "next/navigation": { useSearchParams: () => params },
      "../../../components/cv/CvWorkspace": { CvWorkspace() {} },
    });
    const editor = () => render(exports => exports.default());
    editor();
    let view = editor();
    assert.equal(view.props.editingId, "one");
    view.props.onChange({ ...entry.data, nama: "Nama baru" });
    blocked = true;
    editor().props.onSave();
    assert.match(editor().props.notice, /belum tersimpan/);
    assert.equal(loadSaved()[0].data.nama, DEFAULT_CV.nama);
    blocked = false;
    editor().props.onSave();
    assert.equal(loadSaved()[0].data.nama, "Nama baru");
    params = new URLSearchParams("template=minimalist");
    editor();
    view = editor();
    assert.equal(view.props.cv.templateId, "minimalist");
    assert.equal(view.props.editingId, null, "Changing the query selects a new document");
    blocked = true;
    view.props.onDelete("one");
    assert.equal(editor().props.saved.length, 1);
    assert.match(editor().props.notice, /belum dihapus/);

    blocked = false;
    storage.set("lamaranku_portfolios", JSON.stringify([{ id: "broken", data: { projects: [null] } }]));
    const portfolioRender = harness("components/PortfolioBuilder.tsx");
    const portfolio = () => portfolioRender(exports => exports.PortfolioBuilder());
    const button = (tree, label) => descendants(tree).find(node => node.type === "button" && node.props.children === label);
    portfolio();
    blocked = true;
    button(portfolio(), "Simpan portfolio").props.onClick();
    assert.ok(descendants(portfolio()).some(node => node.props.role === "status" && node.props.children.join("").includes("belum tersimpan")));
    blocked = false;
    button(portfolio(), "Simpan portfolio").props.onClick();
    assert.equal(JSON.parse(storage.get("lamaranku_portfolios")).length, 1);

    let changed;
    const pickerRender = harness("components/cv/CvTemplatePicker.tsx", { "./template-picker.css": {} });
    const picker = pickerRender(exports => exports.CvTemplatePicker({
      value: { ...entry.data, nama: "Nama pribadi" }, onChange: value => { changed = value; }, plus: false,
    }));
    const options = descendants(picker);
    options.find(node => node.type === "button" && node.props["aria-label"]?.startsWith("Adelaide,")).props.onClick();
    assert.equal(changed.templateId, "adelaide");
    assert.equal(changed.nama, "Nama pribadi");
    options.find(node => node.type === "button" && node.props["aria-label"]?.startsWith("Columbia,")).props.onClick();
    assert.equal(changed.templateId, "adelaide", "Basic cannot select a locked template");
    const html = require("react-dom/server").renderToStaticMarkup(picker);
    assert.ok(html.includes(DEFAULT_CV.nama));
    assert.ok(!html.includes("Nama pribadi"), "Gallery examples are static while the editor retains user data");
  } finally {
    global.localStorage = originalStorage;
  }
});
