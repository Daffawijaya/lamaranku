import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { sessionCookieOptions } from "./session-policy";

// Satu klien per tab: setiap instance mendaftarkan GoTrueClient dan timer
// refresh token sendiri, jadi instansiasi berulang membuang koneksi & memori.
// Factory terpisah supaya tipe inferensi identik dengan sebelumnya.
function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: true, autoRefreshToken: true },
      cookies: {
        encode: "tokens-only",
        getAll: () => typeof document === "undefined" ? [] : parseCookieHeader(document.cookie),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookieHeader(name, value, sessionCookieOptions(options));
          });
        },
      },
    }
  );
}
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined;
export function supabaseBrowser() {
  return (browserClient ??= createBrowserSupabaseClient());
}
