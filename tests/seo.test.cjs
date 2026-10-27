const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");

function load(file, env, cache = new Map()) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename);
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  new Function("require", "exports", "process", outputText)(name =>
    name.startsWith(".") ? load(path.resolve(path.dirname(filename), name + ".ts"), env, cache) : require(name),
  module.exports, { env });
  cache.set(filename, module.exports);
  return module.exports;
}

test("SEO uses one public origin, excludes private URLs, and safely serializes structured data", async () => {
  const env = { NEXT_PUBLIC_SITE_URL: "https://example.test/" };
  const seo = load("lib/seo.ts", env);
  const sitemap = load("app/sitemap.ts", env).default();
  const robots = load("app/robots.ts", env).default();
  assert.equal(seo.SITE_URL, "https://example.test");
  assert.equal(new Set(sitemap.map(item => item.url)).size, sitemap.length);
  for (const item of sitemap) {
    assert.equal(new URL(item.url).origin, seo.SITE_URL);
    assert.ok(!/dashboard|masuk|reset-password|api\/|auth\/|\?/.test(item.url));
  }
  for (const expected of ["/cv-builder", "/cv-ats", "/portfolio"]) {
    assert.ok(sitemap.some(item => item.url === seo.SITE_URL + expected));
    const meta = seo.pageMetadata(expected, "Judul", "Deskripsi");
    assert.equal(meta.alternates.canonical, seo.SITE_URL + expected);
    assert.equal(meta.openGraph.url, meta.alternates.canonical);
    assert.equal(meta.robots.index, true);
    assert.equal(meta.twitter.card, "summary_large_image");
  }
  assert.equal(robots.sitemap, "https://example.test/sitemap.xml");
  assert.ok(robots.rules.disallow.includes("/dashboard"));
  const preview = { ...env, VERCEL_ENV: "preview" };
  assert.equal(load("lib/seo.ts", preview).pageMetadata("/", "Judul", "Isi").robots.index, false);
  assert.equal(load("app/robots.ts", preview).default().rules.disallow, "/");

  const { StructuredData } = load("components/seo/StructuredData.tsx", env);
  const value = { name: "</script><script>alert(1)</script>" };
  const html = StructuredData({ data: value }).props.dangerouslySetInnerHTML.__html;
  assert.ok(!html.includes("<"), "JSON-LD must not be able to close its script tag");
  assert.deepEqual(JSON.parse(html), value);
  const schema = seo.featureSchema("/cv-builder", "CV Builder", "Deskripsi");
  assert.equal(schema["@graph"][1].itemListElement[1].item, "https://example.test/cv-builder");
  assert.ok(!JSON.stringify(schema).includes("aggregateRating"));

  const headers = await require("../next.config.js").headers();
  for (const source of ["/masuk", "/reset-password", "/dashboard/:path*", "/api/:path*"]) {
    assert.ok(headers.some(rule => rule.source === source && rule.headers.some(header => header.key === "X-Robots-Tag" && header.value.includes("noindex"))));
  }
});

test("built public pages have unique titles, one H1, and canonical URLs", {
  skip: !fs.existsSync(".next-verify/server/app/cv-ats.html"),
}, () => {
  const { PUBLIC_PATHS, SITE_URL } = load("lib/seo.ts", process.env);
  const titles = new Set();
  for (const route of PUBLIC_PATHS) {
    const file = `.next-verify/server/app/${route === "/" ? "index" : route.slice(1)}.html`;
    const html = fs.readFileSync(file, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title?.includes("Lamaranku"), route);
    assert.ok(!titles.has(title), `Duplicate title: ${route}`);
    titles.add(title);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one stable H1: ${route}`);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, `Missing canonical: ${route}`);
    assert.equal(new URL(canonical).href, new URL(route, SITE_URL).href, `Canonical: ${route}`);
    assert.ok(html.includes("og:image"), `Open Graph image: ${route}`);
    assert.ok(!html.includes('name="robots" content="noindex'), `Public page accidentally noindexed: ${route}`);
  }
});
