import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sessionCookieOptions } from "./session-policy";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        encode: "tokens-only",
        getAll: () => store.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            try {
              store.set(name, value, sessionCookieOptions(options));
            } catch {}
          });
        },
      },
    }
  );
}
