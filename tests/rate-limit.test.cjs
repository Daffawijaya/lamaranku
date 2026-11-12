const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const path = require("node:path");
function load(filename, mocks = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  new Function("require", "exports", outputText)(
    name => (name in mocks ? mocks[name] : require(name)),
    module.exports,
  );
  return module.exports;
}

function loadWithRpc(rpc) {
  return load(path.join(__dirname, "..", "lib", "rate-limit.ts"), {
    "./supabase/server": { supabaseServer: async () => ({ rpc }) },
  });
}

test("rate limiter mengizinkan request yang masih dalam kuota", async () => {
  const rateLimit = loadWithRpc(async () => ({ data: { allowed: true, remaining: 9 }, error: null }));
  const result = await rateLimit.checkRateLimit("skor-review", 12, 3600);
  assert.equal(result.allowed, true);
});

test("rate limiter menolak request di atas kuota dan membawa info sisa waktu", async () => {
  const rateLimit = loadWithRpc(async () => ({ data: { allowed: false, retry_after_seconds: 42 }, error: null }));
  const result = await rateLimit.checkRateLimit("skor-review", 12, 3600);
  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterSeconds, 42);
});

test("migrasi yang belum dijalankan tidak mengunci pengguna (fail open)", async () => {
  const rateLimit = loadWithRpc(async () => ({ data: null, error: { message: "function public.rate_limit_hit does not exist" } }));
  assert.equal((await rateLimit.checkRateLimit("skor-review", 12, 3600)).allowed, true);
});

test("kegagalan jaringan saat cek rate limit diizinkan (fail open)", async () => {
  const rateLimit = loadWithRpc(async () => {
    throw new Error("fetch failed");
  });
  assert.equal((await rateLimit.checkRateLimit("skor-repair", 6, 3600)).allowed, true);
});

test("jawaban RPC yang tidak dikenal diizinkan (fail open)", async () => {
  const rateLimit = loadWithRpc(async () => ({ data: "unexpected", error: null }));
  assert.equal((await rateLimit.checkRateLimit("portfolio-save", 120, 3600)).allowed, true);
});
