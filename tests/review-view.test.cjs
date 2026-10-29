require("./helpers/localization.cjs");
const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");

test("one review page renders input, progress, results and retry without route changes", () => {
  let state = { busy: false, phase: "awal", staged: null };
  const Input = () => null, Progress = () => null, Results = () => null;
  const mocks = {
    "react/jsx-runtime": require("react/jsx-runtime"),
    "lucide-react": { CheckCircle2: () => null },
    "../SkorChecker": { useSkor: dashboard => { assert.equal(dashboard, true); return state; }, SkorHasil: Results },
    "./CvReviewProgress": { CvReviewProgress: Progress },
    "./DashboardReviewInput": { DashboardReviewInput: Input },
  };
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync("components/dashboard/DashboardReview.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  new Function("require", "exports", outputText)(name => {
    if (name.endsWith("/i18n/LanguageProvider")) return require("./helpers/localization.cjs").mock;
    assert.ok(name in mocks, `Unexpected dependency: ${name}`);
    return mocks[name];
  }, module.exports);
  const walk = node => React.isValidElement(node) ? [node, ...React.Children.toArray(node.props.children).flatMap(walk)] : [];
  for (const [phase, busy, expected] of [["awal", false, Input], ["siap", false, Input], ["baca", true, Progress], ["nilai", true, Progress], ["hasil", false, Results], ["gagal", false, Input]]) {
    state = { ...state, phase, busy };
    const nodes = walk(module.exports.DashboardReview());
    for (const view of [Input, Progress, Results]) assert.equal(nodes.some(node => node.type === view), view === expected, phase);
    assert.equal(nodes.find(node => node.type === expected).props.s, state);
  }
});
