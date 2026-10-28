const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");
const runtime = require("react/jsx-runtime");

function load(filename, mocks = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  new Function("require", "exports", outputText)(name => name in mocks ? mocks[name] : require(name), module.exports);
  return module.exports;
}
const { profileHue } = load("lib/dashboard.ts");
const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
const labeled = (tree, label) => walk(tree).find(node => node.props["aria-label"] === label);

function harness({ mobile = false, preference = false } = {}) {
  const events = [], states = [], effects = [], pending = [], listeners = new Map();
  let cursor = 0, path = "/dashboard", query = "", failLogout = false;
  const media = { matches: mobile, addEventListener(name, fn) { this.changed = fn; }, removeEventListener() {} };
  const body = { style: { overflow: "" } };
  global.window = { matchMedia: () => media };
  global.document = {
    body,
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
  };
  const focus = () => events.push(["focus"]);
  const nodes = {
    "dashboard-sidebar": { querySelector: () => ({ focus }), querySelectorAll: () => [{ focus }, { focus }] },
    "dash-menus": { querySelectorAll: () => [], contains: () => false },
    "dash-body": { scrollTop: 100 },
    "dash-chrome-button": { focus },
    search: { focus },
  };
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = initial;
      return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!effects[i] || deps.some((value, index) => !Object.is(value, effects[i].deps[index]))) {
        const previous = effects[i];
        effects[i] = { deps };
        pending.push(() => { previous?.cleanup?.(); effects[i].cleanup = fn(); });
      }
    },
  };
  const attach = render => (type, props, key) => {
    if (props.ref) props.ref.current = nodes[props.id] || nodes[props.className] || nodes[props.type];
    return render(type, props, key);
  };
  const tools = ["", "/cv-builder", "/skor", "/portfolio", "/surat"].map((suffix, i) => ({ href: "/dashboard" + suffix, title: ["Ringkasan", "CV Builder", "Review CV", "Portofolio", "Surat lamaran"][i], icon() {}, activeIcon() {} }));
  const { DashboardShell } = load("components/dashboard/DashboardShell.tsx", {
    react: hooks,
    "react/jsx-runtime": { jsx: attach(runtime.jsx), jsxs: attach(runtime.jsxs) },
    "next/link": { default() {} },
    "next/navigation": { usePathname: () => path, useRouter: () => ({ push: (url, options) => events.push(["push", url, options]), replace: url => events.push(["replace", url]), refresh: () => events.push(["refresh"]), back() {}, forward() {} }) },
    "./AccountContext": { useAccountId: () => "account-one" },
    "./DashboardData": { DashboardDataProvider() {}, useDashboardData: () => ({ saved: [1, 2], query, setQuery: value => { query = value; } }) },
    "./navigation": { dashboardTools: tools, currentDashboardTool: () => tools.find(tool => tool.href === path) || tools[0] },
    "../../lib/account-storage": { readAccountValue: () => preference, writeAccountValue: (...args) => events.push(["preference", ...args]) },
    "../../lib/cv": { isPlus: () => false, loadSaved: id => { events.push(["load", id]); return ["saved-cv"]; } },
    "../../lib/dashboard": { profileHue, downloadDashboardSummary: entries => events.push(["export", entries]) },
    "../../lib/supabase/client": { supabaseBrowser: () => ({ auth: { signOut: async () => ({ error: failLogout ? new Error("offline") : null }) } }) },
  });
  const props = { email: "test@example.test", name: "Nama Pengguna", children: runtime.jsx("div", { children: "Konten fitur tetap ada" }) };
  const frame = DashboardShell(props).props.children;
  return {
    events, body, tools, content: nodes["dash-body"],
    setPath(value) { path = value; },
    failLogout(value) { failLogout = value; },
    dispatchKey(key) { listeners.get("keydown")?.forEach(fn => fn({ key })); },
    render() { cursor = 0; const tree = frame.type(frame.props); pending.splice(0).forEach(fn => fn()); return tree; },
    dispose() { effects.forEach(effect => effect?.cleanup?.()); },
  };
}

test("dashboard rail expands per account, retains feature actions, and closes the mobile overlay accessibly", async () => {
  const original = { window: global.window, document: global.document };
  let h;
  try {
    assert.equal(profileHue("account-one"), profileHue("account-one"));
    assert.ok(profileHue("account-one") >= 0 && profileHue("account-one") < 360);
    h = harness(); h.render();
    let tree = h.render();
    assert.equal(labeled(tree, "Navigasi dashboard").type, "nav");
    assert.equal(walk(tree).filter(node => node.type === "aside").length, 1);
    const shellCss = fs.readFileSync("components/dashboard/shell.css", "utf8");
    assert.match(shellCss.match(/\.dash\s*\{([^}]+)\}/)[1], /overflow:\s*clip\s*;/, "The fixed app shell must not be a programmatic scroll container");
    for (const link of walk(tree).filter(node => typeof node.props.href === "string" && node.props.href.startsWith("/dashboard"))) {
      assert.equal(link.props.scroll, false, "Dashboard navigation must leave scroll control to its content pane");
    }
    for (const label of ["Ringkasan", "CV Builder", "Review CV", "Portofolio", "Surat lamaran"]) assert.ok(labeled(tree, label));
    for (const tool of h.tools) {
      h.setPath(tool.href);
      tree = h.render();
      assert.equal(labeled(tree, tool.title).props["aria-current"], "page");
      const heading = labeled(tree, "Judul halaman");
      assert.equal(heading.type, "header");
      assert.ok(walk(heading).some(node => node.props.children === tool.title));
      assert.equal(labeled(tree, tool.title).props.children[0].type, tool.activeIcon);
      for (const inactive of h.tools.filter(item => item !== tool)) {
        assert.equal(labeled(tree, inactive.title).props["aria-current"], undefined);
        assert.notEqual(labeled(tree, inactive.title).props.children[0].type, inactive.activeIcon);
      }
    }
    h.setPath("/dashboard");
    tree = h.render();
    assert.ok(walk(tree).some(node => node.props.children === "Konten fitur tetap ada"));
    labeled(tree, "Perlebar sidebar").props.onClick();
    tree = h.render();
    assert.ok(tree.props.className.includes("is-expanded"));
    assert.deepEqual(h.events.find(event => event[0] === "preference"), ["preference", "lamaranku_sidebar_expanded", true, "account-one"]);
    assert.equal(h.body.style.overflow, "", "Desktop expansion must not lock scrolling");
    labeled(tree, "Unduh ringkasan CV").props.onClick();
    assert.deepEqual(h.events.find(event => event[0] === "load"), ["load", "account-one"]);
    assert.deepEqual(h.events.find(event => event[0] === "export"), ["export", ["saved-cv"]]);
    h.content.scrollTop = 200;
    h.setPath("/dashboard/cv-builder"); h.render(); tree = h.render();
    assert.equal(h.content.scrollTop, 0, "Navigation should start at the top of the new content pane");
    labeled(tree, "Cari CV tersimpan").props.onChange({ target: { value: "CV saya" } });
    tree = h.render();
    assert.equal(labeled(tree, "Cari CV tersimpan").props.value, "CV saya");
    walk(tree).find(node => node.props.role === "search").props.onSubmit({ preventDefault() {} });
    assert.ok(h.events.some(event => event[0] === "push" && event[1] === "/dashboard" && event[2]?.scroll === false));
    h.failLogout(true);
    labeled(tree, "Keluar dari akun").props.onClick();
    await new Promise(resolve => setImmediate(resolve));
    tree = h.render();
    assert.ok(walk(tree).some(node => node.props.role === "alert"));
    h.failLogout(false);
    labeled(tree, "Keluar dari akun").props.onClick();
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(h.events.some(event => event[0] === "replace" && event[1] === "/masuk"));
    h.dispose();

    h = harness({ mobile: true, preference: true }); h.render(); tree = h.render();
    labeled(tree, "Perlebar sidebar").props.onClick();
    tree = h.render();
    assert.ok(tree.props.className.includes("is-nav-open"));
    assert.equal(labeled(tree, "Menu dashboard").props["aria-modal"], true);
    assert.equal(h.body.style.overflow, "hidden");
    h.dispatchKey("Escape");
    tree = h.render();
    assert.ok(!tree.props.className.includes("is-nav-open"));
    assert.equal(h.body.style.overflow, "");
    labeled(tree, "Perlebar sidebar").props.onClick(); h.render();
    h.setPath("/dashboard/skor"); h.render(); tree = h.render();
    assert.ok(!tree.props.className.includes("is-nav-open"));
    assert.equal(h.body.style.overflow, "");
  } finally {
    h?.dispose();
    global.window = original.window;
    global.document = original.document;
  }
});
