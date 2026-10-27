import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Adapted from Etamhub: one small, read-only database query per day.
// Uses the anon role; RLS stays enabled and no profile data is returned.
export async function GET(req: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store" },
  });
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ ok: false, error: "CRON_SECRET belum dikonfigurasi." }, 503);
  const actual = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return json({ ok: false, error: "Konfigurasi Supabase belum lengkap." }, 503);
  try {
    const target = new URL("/rest/v1/profiles", url);
    target.searchParams.set("select", "id");
    target.searchParams.set("limit", "1");
    const response = await fetch(target, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(15000)]),
    });
    // An empty result under anon RLS is fine: the database query still ran.
    if (!response.ok) {
      console.error("Supabase keep-alive query failed", { status: response.status });
      return json({ ok: false, error: "Query Supabase gagal. Periksa status proyek dan tabel profiles." }, 502);
    }
    await response.arrayBuffer();
    return json({ ok: true, at: new Date().toISOString() });
  } catch {
    return json({ ok: false, error: "Supabase tidak dapat dihubungi atau melewati batas waktu." }, 502);
  }
}
