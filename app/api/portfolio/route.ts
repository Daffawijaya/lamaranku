import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase/server";
import { hasActivePlus } from "../../../lib/plus-access";
import { parseWebPortfolio, validPortfolioSlug } from "../../../lib/portfolio";

const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return reply({ error: "Masuk untuk membuka portofolio." }, 401);
  const { data, error } = await db
    .from("portfolio_websites")
    .select("slug,draft,published,published_at,updated_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error)
    return reply(
      {
        error:
          "Penyimpanan website belum tersedia. Hubungi admin untuk mengaktifkannya.",
      },
      503,
    );
  return reply({ site: data, plus: hasActivePlus(user) });
}
export async function PUT(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return reply({ error: "Permintaan tidak valid." }, 403);
  if (Number(request.headers.get("content-length")) > 100000)
    return reply({ error: "Isi terlalu besar." }, 413);
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return reply({ error: "Sesi berakhir. Silakan masuk lagi." }, 401);
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 100000)
      return reply({ error: "Isi terlalu besar." }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body))
      return reply({ error: "Data tidak valid." }, 400);
    if (!["save", "publish", "unpublish"].includes(body.action))
      return reply({ error: "Tindakan tidak valid." }, 400);
    if (body.action !== "unpublish" && !hasActivePlus(user))
      return reply(
        { error: "Penerbitan website tersedia untuk akun Plus." },
        403,
      );
    const document =
      body.action === "unpublish"
        ? {}
        : parseWebPortfolio(body.document, user.id);
    if (body.action !== "unpublish" && !validPortfolioSlug(body.slug ?? ""))
      return reply(
        {
          error:
            "Alamat harus 3–40 karakter: huruf kecil, angka, dan tanda hubung.",
        },
        400,
      );
    if (
      body.action === "publish" &&
      (!("name" in document) ||
        !document.name ||
        !("role" in document) ||
        !document.role)
    )
      return reply(
        { error: "Lengkapi nama dan peran sebelum menerbitkan." },
        400,
      );
    const { data, error } = await db.rpc("save_portfolio_website", {
      site_slug: body.slug ?? "",
      document,
      action: body.action,
    });
    if (error) {
      if (error.code === "23505")
        return reply(
          { error: "Alamat ini sudah dipakai. Pilih alamat lain." },
          409,
        );
      if (error.message.includes("PLUS_REQUIRED"))
        return reply({ error: "Akses Plus sudah tidak aktif." }, 403);
      if (error.message.includes("UNPUBLISH_BEFORE_RENAME"))
        return reply(
          {
            error:
              "Nonaktifkan website sebelum mengganti alamat, atau pilih Terbitkan perubahan.",
          },
          409,
        );
      return reply(
        { error: "Website belum tersimpan. Coba lagi atau hubungi admin." },
        503,
      );
    }
    return reply({ site: data });
  } catch (error) {
    return reply(
      {
        error:
          error instanceof SyntaxError
            ? "Data tidak valid."
            : error instanceof Error
              ? error.message
              : "Data tidak valid.",
      },
      400,
    );
  }
}
