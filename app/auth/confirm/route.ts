import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");
  let confirmed = false;
  if (token && (type === "email" || type === "signup")) {
    try {
      // No browser-bound PKCE verifier: email links also work on another device.
      // Do not create a login session; the user returns to the login form.
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
      );
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: token, type });
      confirmed = !error && Boolean(data.user?.email_confirmed_at);
    } catch { /* Show an actionable error without exposing the token. */ }
  }
  const response = NextResponse.redirect(new URL("/auth/confirmed", req.url));
  response.cookies.set("email-confirmation-result", confirmed ? "success" : "error", {
    httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "lax",
    path: "/auth/confirmed", maxAge: 120,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
