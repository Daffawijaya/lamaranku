import { setTimeout as delay } from "node:timers/promises";

type GeminiRequest = {
  model: string;
  fallbackModel: string;
  key: string;
  signal: AbortSignal;
  payload: (model: string, fallback: boolean) => unknown;
};

export async function requestGeminiReview(options: GeminiRequest) {
  const models = [
    ...new Set([options.model, options.fallbackModel].filter(Boolean)),
  ];
  // One delayed retry of the last model; the caller's total deadline still applies.
  const attempts = [...models, models[models.length - 1]];
  for (const [index, model] of attempts.entries()) {
    const fallback = model !== options.model;
    if (index === models.length) {
      await delay(1000 + Math.floor(Math.random() * 1000), undefined, { signal: options.signal });
    }
    options.signal.throwIfAborted();
    const attemptTimeout = AbortSignal.timeout(fallback ? 110_000 : 30_000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": options.key,
          },
          signal: AbortSignal.any([options.signal, attemptTimeout]),
          body: JSON.stringify(options.payload(model, fallback)),
        },
      );
      // A quota error may use the separately configured model once; never retry
      // the same exhausted model or loop back to it.
      if (response.status === 429 && index < models.length - 1) {
        await response.body?.cancel();
        continue;
      }
      // Temporary provider failures may retry within the caller's deadline.
      if (
        index < attempts.length - 1 &&
        [500, 502, 503, 504].includes(response.status)
      ) {
        await response.body?.cancel();
        continue;
      }
      // Buffer successful responses inside the attempt deadline, including body reads.
      const completeResponse = response.ok
        ? new Response(await response.text(), {
            status: response.status,
            headers: response.headers,
          })
        : response;
      return { response: completeResponse, model, usedFallback: fallback };
    } catch (error) {
      if (options.signal.aborted) throw error;
      if (
        index < attempts.length - 1 &&
        (attemptTimeout.aborted || error instanceof TypeError)
      )
        continue;
      throw error;
    }
  }
  throw new Error(
    "Review AI belum dapat diproses oleh layanan utama maupun cadangan.",
  );
}
