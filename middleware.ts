import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const guarded = ["/cv-builder/isi"];

function safeNext(value: string | null): string | null {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res; // Auth belum dikonfigurasi: lewatkan, halaman klien yang menampilkan pesan.
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
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
    return NextResponse.redirect(login);
  }
  // Sudah login tapi buka /masuk manual: kembalikan ke tujuan (default /cv-builder).
  if (user && req.nextUrl.pathname === "/masuk") {
    const back = req.nextUrl.clone();
    back.pathname = safeNext(req.nextUrl.searchParams.get("next")) ?? "/cv-builder";
    back.search = "";
    return NextResponse.redirect(back);
  }
  return res;
}

export const config = { matcher: ["/cv-builder/isi/:path*", "/masuk"] };
