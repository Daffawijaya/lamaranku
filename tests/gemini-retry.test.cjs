const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

test("Gemini retries temporary failures, switches models once on quota, and stops on auth errors", async () => {
  const code = ts.transpileModule(fs.readFileSync("lib/gemini-review.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const nativeFetch = global.fetch;
  let abortDuringDelay = false;
  let controller;
  const waits = [];
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(name => {
    assert.equal(name, "node:timers/promises");
    return { setTimeout: async (ms, value, { signal }) => {
      waits.push(ms);
      assert.ok(ms >= 1000 && ms < 2000);
      if (abortDuringDelay) controller.abort();
      signal.throwIfAborted();
    } };
  }, module, module.exports);

  async function run(statuses, fallbackModel = "backup") {
    controller = new AbortController();
    const calls = [];
    waits.length = 0;
    global.fetch = async (url, options) => {
      const model = new URL(url).pathname.split("/").pop().split(":")[0];
      calls.push(model);
      assert.equal(options.signal.aborted, false);
      const status = statuses.shift();
      if (status instanceof Error) throw status;
      assert.ok(status, "Unexpected extra attempt");
      return new Response(JSON.stringify({ ok: status === 200 }), { status });
    };
    return { calls, result: module.exports.requestGeminiReview({
      model: "primary", fallbackModel, key: "synthetic-test-key", signal: controller.signal,
      payload: (model, fallback) => ({ model, fallback }),
    }) };
  }

  try {
    let attempt = await run([503, 503, 200]);
    let result = await attempt.result;
    assert.deepEqual(attempt.calls, ["primary", "backup", "backup"]);
    assert.equal(waits.length, 1);
    assert.equal(result.usedFallback, true);
    assert.equal(result.model, "backup");
    assert.equal(result.response.status, 200);

    attempt = await run([503, 503, 503]);
    result = await attempt.result;
    assert.equal(result.response.status, 503);
    assert.equal(attempt.calls.length, 3, "Retries must stop while the provider remains unavailable");

    for (const status of [400, 401, 403, 404]) {
      attempt = await run([status]);
      assert.equal((await attempt.result).response.status, status);
      assert.deepEqual(attempt.calls, ["primary"]);
      assert.equal(waits.length, 0);
    }

    attempt = await run([429, 200]);
    result = await attempt.result;
    assert.equal(result.response.status, 200);
    assert.equal(result.usedFallback, true);
    assert.deepEqual(attempt.calls, ["primary", "backup"]);
    assert.equal(waits.length, 0);

    attempt = await run([429, 429]);
    assert.equal((await attempt.result).response.status, 429);
    assert.deepEqual(attempt.calls, ["primary", "backup"]);
    assert.equal(waits.length, 0);

    for (const fallback of ["", "primary"]) {
      attempt = await run([429], fallback);
      assert.equal((await attempt.result).response.status, 429);
      assert.deepEqual(attempt.calls, ["primary"]);
    }

    attempt = await run([503, 200], "");
    result = await attempt.result;
    assert.deepEqual(attempt.calls, ["primary", "primary"]);
    assert.equal(result.usedFallback, false);

    attempt = await run([new TypeError("Temporary network failure"), 200]);
    assert.equal((await attempt.result).response.status, 200);
    assert.deepEqual(attempt.calls, ["primary", "backup"]);

    abortDuringDelay = true;
    attempt = await run([503, 503]);
    await assert.rejects(attempt.result, { name: "AbortError" });
    assert.deepEqual(attempt.calls, ["primary", "backup"]);
  } finally {
    global.fetch = nativeFetch;
  }
});
