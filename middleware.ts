import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const guarded = ["/cv-builder/isi", "/dashboard"];

function safeNext(value: string | null): string | null {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value)) return value;
  return null;
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res; // Auth belum dikonfigurasi: lewatkan, halaman klien yang menampilkan pesan.
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        encode: "tokens-only",
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && guarded.some((p) => req.nextUrl.pathname.startsWith(p))) {
    const login = req.nextUrl.clone();
    login.pathname = "/masuk";
    login.search = "";
    login.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    res.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  // Sudah login tapi buka /masuk manual: kembalikan ke tujuan (default /dashboard).
  if (user && req.nextUrl.pathname === "/masuk") {
    const back = req.nextUrl.clone();
    const destination = new URL(safeNext(req.nextUrl.searchParams.get("next")) ?? "/dashboard", req.url);
    back.pathname = destination.pathname;
    back.search = destination.search;
    const redirect = NextResponse.redirect(back);
    res.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  return res;
}

export const config = { matcher: ["/cv-builder/isi/:path*", "/dashboard/:path*", "/masuk"] };
