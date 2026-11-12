import { supabaseServer } from "./supabase/server";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number };

/**
 * Token bucket per akun via RPC Supabase (inkremen atomik di database; pemilik
 * bucket = auth.uid()). Kalau migrasi supabase/rate-limits.sql belum dijalankan,
 * request diizinkan (fail open) dan hanya dicatat di log server.
 */
export async function checkRateLimit(
  kind: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_kind: kind,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    if (!data || typeof data !== "object")
      throw new Error("jawaban rate limit tidak dikenal");
    const retry = (data as { retry_after_seconds?: unknown }).retry_after_seconds;
    return {
      allowed: (data as { allowed?: unknown }).allowed !== false,
      retryAfterSeconds: typeof retry === "number" && Number.isFinite(retry) ? retry : undefined,
    };
  } catch (error) {
    console.warn(
      `rate limit ${kind} tidak tersedia, request diizinkan:`,
      error instanceof Error ? error.message : error,
    );
    return { allowed: true };
  }
}
