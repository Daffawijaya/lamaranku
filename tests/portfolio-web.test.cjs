const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, mocks = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  new Function("require", "exports", outputText)(
    (name) => (name in mocks ? mocks[name] : require(name)),
    module.exports,
  );
  return module.exports;
}
const portfolio = load("lib/portfolio.ts");
const { hasActivePlus } = load("lib/plus-access.ts");
const owner = "11111111-1111-4111-8111-111111111111";
const outsider = "22222222-2222-4222-8222-222222222222";
const doc = () => ({
  ...portfolio.EMPTY_WEB_PORTFOLIO,
  name: "Raka",
  role: "Designer",
  skills: ["Figma", "Figma", " React "],
});
test("portfolio validation rejects executable links, oversized content and forged asset ownership", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  try {
    assert.deepEqual(portfolio.parseWebPortfolio(doc(), owner).skills, [
      "Figma",
      "React",
    ]);
    for (const website of [
      "javascript:alert(1)",
      "data:text/html,test",
      "https://name:password@example.com",
      "//evil.example",
    ])
      assert.throws(() =>
        portfolio.parseWebPortfolio({ ...doc(), website }, owner),
      );
    assert.throws(() =>
      portfolio.parseWebPortfolio({ ...doc(), bio: "a".repeat(3001) }, owner),
    );
    assert.throws(() =>
      portfolio.parseWebPortfolio({ ...doc(), template: "unknown" }, owner),
    );
    const image = `${owner}/${outsider}.webp`;
    assert.equal(
      portfolio.parseWebPortfolio({ ...doc(), avatar: image }, owner).avatar,
      image,
    );
    assert.throws(() =>
      portfolio.parseWebPortfolio({ ...doc(), avatar: image }, outsider),
    );
    assert.throws(() =>
      portfolio.parseWebPortfolio(
        { ...doc(), avatar: "https://external.example/photo.png" },
        owner,
      ),
    );
    assert.throws(() =>
      portfolio.parseWebPortfolio({ ...doc(), projects: [null] }, owner),
    );
    assert.equal(portfolio.portfolioImageUrl("../../secret"), undefined);
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  }
});
test("published snapshot fingerprints ignore JSONB key order and detect real edits", () => {
  const document = { ...doc(), website: "https://raka.example" };
  const reordered = Object.fromEntries(Object.entries(document).reverse());
  assert.equal(
    portfolio.portfolioFingerprint(document, owner),
    portfolio.portfolioFingerprint(reordered, owner),
  );
  assert.notEqual(
    portfolio.portfolioFingerprint(document, owner),
    portfolio.portfolioFingerprint({ ...document, name: "Raka Putra" }, owner),
  );
  assert.equal(
    portfolio.portfolioFingerprint({ template: "unknown" }, owner),
    null,
  );
});
test("public slugs accept shareable addresses and reject reserved paths or traversal", () => {
  for (const slug of ["raka-putra", "abc", "a1b", "a".repeat(40)])
    assert.equal(portfolio.validPortfolioSlug(slug), true);
  for (const slug of [
    "ab",
    "Aka",
    "-raka",
    "raka-",
    "admin",
    "api",
    "lamaranku",
    "../raka",
    "a".repeat(41),
  ])
    assert.equal(portfolio.validPortfolioSlug(slug), false);
});
function api({
  plan = "plus",
  plus_until,
  authenticated = true,
  rpcError = null,
  site,
  files = [],
} = {}) {
  const calls = [];
  const removals = [];
  const db = {
    auth: {
      getUser: async () => ({
        data: {
          user: authenticated
            ? { id: owner, app_metadata: { plan, plus_until } }
            : null,
        },
      }),
    },
    storage: {
      from: () => ({
        list: async () => ({
          data: files.map((name) => ({ name })),
          error: null,
        }),
        remove: async (paths) => {
          removals.push(...paths);
          return { error: null };
        },
      }),
    },
    rpc: async (name, args) => {
      calls.push({ name, args });
      return {
        data:
          site === undefined
            ? {
                slug: args.site_slug,
                draft: args.document,
                published: null,
                published_at: null,
              }
            : site,
        error: rpcError,
      };
    },
  };
  const route = load("app/api/portfolio/route.ts", {
    "../../../lib/supabase/server": { supabaseServer: async () => db },
    "../../../lib/plus-access": { hasActivePlus },
    "../../../lib/portfolio": portfolio,
  });
  const put = (body, origin = "https://lamaranku.test") =>
    route.PUT(
      new Request("https://lamaranku.test/api/portfolio", {
        method: "PUT",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  return { calls, put, removals };
}
test("publishing API enforces authentication, current Plus, origin, profile and slug before storage", async () => {
  const payload = { action: "publish", slug: "raka-putra", document: doc() };
  for (const options of [
    { authenticated: false },
    { plan: "basic" },
    { plus_until: "2020-01-01T00:00:00Z" },
  ]) {
    const h = api(options);
    assert.ok([401, 403].includes((await h.put(payload)).status));
    assert.equal(h.calls.length, 0);
  }
  const h = api();
  assert.equal((await h.put(payload, "https://evil.example")).status, 403);
  assert.equal((await h.put({ ...payload, slug: "admin" })).status, 400);
  assert.equal(
    (await h.put({ ...payload, document: { ...doc(), name: "" } })).status,
    400,
  );
  assert.equal(h.calls.length, 0);
  assert.equal((await h.put(payload)).status, 200);
  assert.equal(h.calls[0].name, "save_portfolio_website");
  assert.equal(h.calls[0].args.action, "publish");
});
test("draft saves and unpublishing use separate actions; expired users can take their website offline", async () => {
  const draft = api();
  assert.equal(
    (await draft.put({ action: "save", slug: "raka-putra", document: doc() }))
      .status,
    200,
  );
  assert.equal(draft.calls[0].args.action, "save");
  const expired = api({ plan: "basic" });
  assert.equal((await expired.put({ action: "unpublish" })).status, 200);
  assert.equal(expired.calls[0].args.action, "unpublish");
  const collision = api({ rpcError: { code: "23505", message: "duplicate" } });
  const response = await collision.put({
    action: "publish",
    slug: "raka-putra",
    document: doc(),
  });
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /sudah dipakai/);
});
test("saving removes unreferenced images but keeps files used by the draft or live snapshot", async () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  try {
    const images = {
      draft: "11111111-1111-4111-8111-111111111111.webp",
      live: "22222222-2222-4222-8222-222222222222.webp",
      liveProject: "33333333-3333-4333-8333-333333333333.webp",
      stale: "44444444-4444-4444-8444-444444444444.webp",
    };
    const draft = { ...doc(), avatar: `${owner}/${images.draft}` };
    const published = {
      ...doc(),
      avatar: `${owner}/${images.live}`,
      projects: [
        {
          id: "live-project",
          title: "Live",
          category: "QA",
          description: "",
          url: "",
          image: `${owner}/${images.liveProject}`,
        },
      ],
    };
    const h = api({
      files: Object.values(images),
      site: { draft, published },
    });
    const response = await h.put({
      action: "save",
      slug: "raka-putra",
      document: draft,
    });
    assert.equal(response.status, 200);
    assert.deepEqual(h.removals, [`${owner}/${images.stale}`]);
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  }
});
test("image API accepts only WebP and denies Basic, cross-origin, forged or oversized uploads", async () => {
  let writes = 0;
  const imageRoute = (plan) =>
    load("app/api/portfolio/images/route.ts", {
      "../../../../lib/supabase/server": {
        supabaseServer: async () => ({
          auth: {
            getUser: async () => ({
              data: { user: { id: owner, app_metadata: { plan } } },
            }),
          },
          storage: {
            from: () => ({
              list: async () => ({ data: [], error: null }),
              upload: async (path, bytes, options) => {
                writes++;
                assert.ok(path.startsWith(owner + "/"));
                assert.equal(options.upsert, false);
                return { error: null };
              },
            }),
          },
        }),
      },
      "../../../../lib/plus-access": { hasActivePlus },
    });
  const send = (route, bytes, type, origin = "https://lamaranku.test") => {
    const form = new FormData();
    form.append("image", new Blob([bytes], { type }), "test.webp");
    return route.POST(
      new Request("https://lamaranku.test/api/portfolio/images", {
        method: "POST",
        headers: { Origin: origin },
        body: form,
      }),
    );
  };
  const webp = Buffer.from(
    "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
    "base64",
  );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=",
    "base64",
  );
  assert.equal((await send(imageRoute("basic"), webp, "image/webp")).status, 403);
  assert.equal(
    (await send(imageRoute("plus"), webp, "image/webp", "https://evil.example"))
      .status,
    403,
  );
  assert.equal((await send(imageRoute("plus"), png, "image/png")).status, 400);
  assert.equal((await send(imageRoute("plus"), png, "image/webp")).status, 400);
  assert.equal(
    (await send(imageRoute("plus"), "<svg></svg>", "image/svg+xml")).status,
    400,
  );
  assert.equal(
    (await send(imageRoute("plus"), Buffer.alloc(2097153), "image/webp")).status,
    400,
  );
  assert.equal(writes, 0);
  const result = await send(imageRoute("plus"), webp, "image/webp");
  assert.equal(result.status, 200);
  assert.match((await result.json()).path, /\.webp$/);
  assert.equal(writes, 1);
});
