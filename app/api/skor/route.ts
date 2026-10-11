import { NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const MAX_CHARS = 12000;

const IDS = ["kontak", "kolom", "font", "judul", "angka", "keyword", "bahasa", "halaman", "format", "skill"] as const;

const SYSTEM = `Kamu penilai kesiapan CV terhadap sistem ATS. Nilai 10 kriteria dari teks CV. Balas HANYA JSON valid tanpa markdown: {"ringkasan": "1 kalimat verdict Bahasa Indonesia", "poin": [{"id": "...", "status": "ya|tidak|ragu", "catatan": "maks 12 kata"}]}
Arti tiap id:
kontak: email dan nomor HP aktif tertulis.
kolom: tata satu kolom ('ragu' kecuali teks jelas menunjukkan tabel/kolom ganda).
font: font standar ('ragu' karena tak bisa dipastikan dari teks).
judul: ada bagian Pengalaman, Pendidikan, Keahlian (terima padanan Inggris).
angka: pengalaman menyebut angka hasil (jumlah, persen, waktu).
keyword: skill cocok lowongan ('ragu' bila tak ada info lowongan).
bahasa: satu bahasa penuh (Indonesia atau Inggris).
halaman: maksimal 2 halaman (pakai info jumlah halaman yang diberikan).
format: file PDF (input selalu PDF jadi 'ya').
skill: skill teknis spesifik tertulis, bukan sekadar 'jujur, kerja keras'.`;

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY gratis dari aistudio.google.com ke .env.local." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? "").slice(0, MAX_CHARS).trim();
  const pages = Math.max(0, Number(body?.pages ?? 0) || 0);
  if (text.length < 50) {
    return NextResponse.json({ error: "Teks CV terlalu pendek atau gagal dibaca dari PDF." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ parts: [{ text: `Jumlah halaman PDF: ${pages}\n\n--- ISI CV ---\n${text}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 1500 },
        }),
      }
    );
  } catch {
    return NextResponse.json({ error: "Gagal menghubungi AI. Periksa koneksi lalu coba lagi." }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "AI menolak permintaan (kuota atau kunci bermasalah). Coba lagi nanti." }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  const raw: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  let parsed: { ringkasan?: string; poin?: { id?: string; status?: string; catatan?: string }[] } | null = null;
  try {
    parsed = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
  } catch {
    parsed = null;
  }
  const byId = new Map((parsed?.poin ?? []).map((p) => [p.id, p]));
  if (!parsed || !IDS.every((id) => byId.has(id))) {
    return NextResponse.json({ error: "Jawaban AI tidak lengkap. Coba lagi." }, { status: 502 });
  }

  const poin = IDS.map((id) => {
    const p = byId.get(id)!;
    const status = p.status === "ya" || p.status === "tidak" ? p.status : "ragu";
    return { id, status, catatan: String(p.catatan ?? "").slice(0, 120) };
  });
  return NextResponse.json({ ringkasan: String(parsed.ringkasan ?? "").slice(0, 200), poin });
}
