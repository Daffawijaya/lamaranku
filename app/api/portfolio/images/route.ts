import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseServer } from "../../../../lib/supabase/server";
import { hasActivePlus } from "../../../../lib/plus-access";

export async function POST(request: Request) {
  const fail = (error: string, status: number) =>
    NextResponse.json({ error }, { status });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return fail("Permintaan tidak valid.", 403);
  if (Number(request.headers.get("content-length")) > 2200000)
    return fail("Maksimal 2 MB per gambar.", 413);
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return fail("Silakan masuk lagi.", 401);
  if (!hasActivePlus(user))
    return fail("Unggah gambar website tersedia untuk Plus.", 403);
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || file.size > 2097152 || file.size === 0)
      return fail("Pilih gambar maksimal 2 MB.", 400);
    const bytes = Buffer.from(await file.arrayBuffer());
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
    const mime = png
      ? "image/png"
      : jpeg
        ? "image/jpeg"
        : webp
          ? "image/webp"
          : "";
    if (!mime || mime !== file.type)
      return fail("Gunakan gambar JPG, PNG, atau WebP yang valid.", 400);
    const { data: existing, error: listError } = await db.storage
      .from("portfolio-images")
      .list(user.id, { limit: 101 });
    if (listError)
      return fail("Penyimpanan gambar belum tersedia. Hubungi admin.", 503);
    if ((existing?.length ?? 0) >= 100)
      return fail(
        "Batas 100 unggahan tercapai. Hubungi admin untuk membersihkan gambar lama.",
        409,
      );
    const path = `${user.id}/${randomUUID()}.${png ? "png" : jpeg ? "jpg" : "webp"}`;
    const { error } = await db.storage
      .from("portfolio-images")
      .upload(path, bytes, {
        contentType: mime,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error)
      return fail("Gambar belum terunggah. Coba lagi atau hubungi admin.", 503);
    return NextResponse.json(
      { path },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail("Gambar tidak dapat diproses.", 400);
  }
}
