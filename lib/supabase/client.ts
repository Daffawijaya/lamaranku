import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { sessionCookieOptions } from "./session-policy";

export function supabaseBrowser() {
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
