const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
const code = ts.transpileModule(fs.readFileSync('components/SkorChecker.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const file = { name: 'test-cv.pdf', type: 'application/pdf', size: 100, arrayBuffer: async () => new ArrayBuffer(8) };
const tick = () => new Promise(resolve => setImmediate(resolve));
function harness(inDashboard, { draft = false, user = true, pdfFails = false } = {}) {
    let cursor = 0, states = [], pendingEffects = [], effects = [], events = [], resolveFetch;
    const react = {
        useState(initial) { const i = cursor++; if (!(i in states))
            states[i] = initial; return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next; }]; },
        useRef(initial) { const i = cursor++; if (!(i in states))
            states[i] = { current: initial }; return states[i]; },
        useEffect(fn, deps) { const i = cursor++; if (!effects[i] || deps.some((dep, n) => !Object.is(dep, effects[i][n]))) {
            effects[i] = deps;
            pendingEffects.push(fn);
        } },
        useMemo(fn) { return fn(); }
    };
    const router = { push: path => events.push(['navigate', path]) };
    const mocks = {
        "./dashboard/AccountContext": { useAccountId: () => "test-user" },
        "../lib/account-storage": { readAccountValue: () => null, writeAccountValue() {} },
        react, 'react/jsx-runtime': {}, 'next/navigation': { useRouter: () => router }, 'framer-motion': {}, 'lucide-react': {}, './skor/PdfPreview': {},
        '../lib/skor': { CRITERIA: [] },
        '../lib/review-config': { REVIEW_TIMEOUT_SECONDS: 150 },
        '../lib/pending-review': { savePendingReview: async (id, value) => events.push(['save', id, value]), readPendingReview: async () => ({ file, jobDescription: 'Frontend developer', createdAt: Date.now() }), deletePendingReview: async () => events.push(['delete']) },
        '../lib/supabase/client': { supabaseBrowser: () => ({ auth: { getUser: async () => { events.push(['auth']); return { data: { user: user ? { id: 'test' } : null } }; } } }) },
        '../lib/pdf-client': { loadPdfJs: async () => { events.push(['pdf']); return { getDocument: () => ({ promise: pdfFails ? Promise.reject(new Error('Invalid PDF')) : Promise.resolve({ numPages: 1, getPage: async () => ({ getTextContent: async () => ({ items: [{ str: 'Professional software engineer with experience developing reliable web applications.' }] }), cleanup() { } }) }), destroy: async () => { events.push(['destroy-pdf']); } }) }; } }
    };
    global.window = { location: { search: draft ? '?draft=test' : '' }, history: { replaceState: () => events.push(['clean-url']) }, setInterval: () => 1, clearInterval() { } };
    global.fetch = async (url, options) => { events.push(['api', url, JSON.parse(options.body)]); return new Promise(resolve => { resolveFetch = () => resolve({ ok: true, json: async () => ({ score: 75, ringkasan: 'Review selesai', poin: [{ id: 'test', status: 'ya', catatan: 'Terisi' }] }) }); }); };
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(name => { if (!(name in mocks))
        throw Error('Unexpected module ' + name); return mocks[name]; }, module, module.exports);
    return { events, render() { cursor = 0; const result = module.exports.useSkor(inDashboard); const effectsToRun = pendingEffects; pendingEffects = []; effectsToRun.forEach(fn => fn()); return result; }, finish() { assert.ok(resolveFetch); resolveFetch(); } };
}
require('node:test')('Review starts after login, cleans failed PDFs, and resumes drafts in the dashboard', async () => {
    let h = harness(false), s = h.render();
    s.stage(file);
    s = h.render();
    assert.equal(s.confirmFile, file);
    s.setJobDescription('Frontend developer');
    s = h.render();
    s.confirm();
    await tick();
    s = h.render();
    assert.ok(h.events.some(e => e[0] === 'save' && e[2].file === file && e[2].jobDescription === 'Frontend developer'));
    assert.ok(h.events.some(e => e[0] === 'navigate' && e[1].startsWith('/dashboard/skor?draft=')));
    assert.ok(!h.events.some(e => ['auth', 'pdf', 'api'].includes(e[0])));
    h = harness(true, { draft: true });
    h.render();
    await tick();
    s = h.render();
    assert.equal(s.busy, true);
    assert.equal(s.confirmFile, null);
    assert.equal(s.phase, 'nilai');
    assert.equal(h.events.find(e => e[0] === 'api')[2].jobDescription, 'Frontend developer');
    assert.ok(h.events.findIndex(e => e[0] === 'auth') < h.events.findIndex(e => e[0] === 'pdf'));
    h.finish();
    await tick();
    s = h.render();
    assert.equal(s.phase, 'hasil');
    assert.ok(h.events.some(e => e[0] === 'delete'));
    h = harness(true);
    s = h.render();
    s.stage(file);
    s = h.render();
    assert.equal(s.confirmFile, null);
    s.confirm();
    await tick();
    s = h.render();
    assert.equal(s.confirmFile, null);
    assert.equal(s.busy, true);
    h.finish();
    await tick();
    assert.equal(h.render().phase, 'hasil');
    h = harness(true, { user: false });
    s = h.render();
    s.stage(file);
    s = h.render();
    s.confirm();
    await tick();
    assert.ok(!h.events.some(e => e[0] === 'api' || e[0] === 'pdf'));
    assert.ok(h.events.some(e => e[0] === 'navigate'));
    h = harness(true, { pdfFails: true });
    s = h.render();
    s.stage(file);
    s = h.render();
    s.confirm();
    await tick();
    assert.equal(h.render().phase, 'gagal');
    assert.ok(h.events.some(e => e[0] === 'destroy-pdf'));
});
