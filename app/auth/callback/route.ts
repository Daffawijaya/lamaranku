import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "../../../lib/supabase/server";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value)) return value;
  return "/dashboard";
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const back = safeNext(req.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/masuk", req.url));

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const login = new URL("/masuk", req.url);
    login.searchParams.set("next", back);
    login.searchParams.set("oauth_error", error.message);
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(new URL(back, req.url));
}
