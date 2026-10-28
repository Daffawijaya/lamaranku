const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");

function load(file, mocks = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  new Function("require", "exports", outputText)(name => mocks[name] ?? require(name), module.exports);
  return module.exports;
}

test("review routes follow input, progress, results and recover invalid direct visits", () => {
  const originalWindow = global.window;
  let path = "/dashboard/skor";
  const review = { busy: false, phase: "awal" };
  const navigations = [];
  const router = { replace: (...args) => navigations.push(args) };
  const navigation = load("lib/review-navigation.ts");
  const { ReviewProvider } = load("components/dashboard/ReviewContext.tsx", {
    react: { ...React, useEffect: callback => callback() },
    "next/navigation": { usePathname: () => path, useRouter: () => router },
    "../SkorChecker": { useSkor: () => review },
    "../../lib/review-navigation": navigation,
  });
  try {
    global.window = { location: { search: "?draft=pdf-id" } };
    const render = () => ReviewProvider({ children: "page" });
    render();
    assert.equal(navigations.length, 0);
    review.busy = true; review.phase = "nilai";
    render();
    assert.deepEqual(navigations.pop(), ["/dashboard/skor/proses?draft=pdf-id", { scroll: false }]);
    path = "/dashboard/skor/proses";
    assert.equal(render().props.value, review, "All pages share the same review state");
    assert.equal(navigations.length, 0);
    review.busy = false; review.phase = "hasil";
    render();
    assert.deepEqual(navigations.pop(), ["/dashboard/skor/hasil", { scroll: false }]);
    path = "/dashboard/skor/hasil"; review.phase = "awal";
    render();
    assert.deepEqual(navigations.pop(), ["/dashboard/skor", { scroll: false }]);
    path = "/dashboard/skor/proses"; review.phase = "gagal";
    render();
    assert.deepEqual(navigations.pop(), ["/dashboard/skor", { scroll: false }]);
  } finally { global.window = originalWindow; }
});
