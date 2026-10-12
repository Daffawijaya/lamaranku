import { NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const MAX_CHARS = 12000;
const MAX_PAGES = 50;
const MAX_BODY_BYTES = 1_000_000;

const IDS = ["kontak", "kolom", "font", "judul", "angka", "keyword", "bahasa", "halaman", "format", "skill"] as const;
type CriterionId = (typeof IDS)[number];
type Status = "ya" | "tidak" | "ragu";

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

// Penilaian lokal gratis (tanpa API key, tanpa kirim ke mana pun): heuristik
// regex atas teks. Dipakai otomatis bila GEMINI_API_KEY tidak diset.
const SKILL_KERJA = [
  "excel", "spreadsheet", "microsoft office", "microsoft word", "administrasi",
  "akuntansi", "pajak", "kasir", "gudang", "entri data", "pengarsipan",
  "python", "java", "javascript", "php", "sql", "html", "desain",
  "photoshop", "coreldraw", "autocad", "videografi", "fotografi",
  "marketing", "sales", "copywriting", "seo", "bahasa inggris", "toefl",
  "mengemudi", "sim a", "sim c", "menjahit", "memasak", "las", "teknisi",
];

function clampPages(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_PAGES);
}

function hasPhone(text: string): boolean {
  return /(^|\D)(\+62|62|0)8\d{7,}(\D|$)/.test(text);
}

function countResultNumbers(text: string): number {
  const cleaned = text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, " ")
    .replace(/(\+62|62|08)[\d\s\-()]{7,}/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ") // tahun bukan hasil kerja
    .replace(/\b\d{1,2}:\d{2}\b/g, " "); // jam bukan hasil kerja
  return cleaned.match(/\d+/g)?.length ?? 0;
}

function nilaiLokal(text: string, pages: number) {
  const t = text.toLowerCase();
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const telp = hasPhone(text);

  const adaPengalaman = /pengalaman|experience|work history|riwayat (kerja|pekerjaan)/.test(t);
  const adaPendidikan = /pendidikan|education|sekolah|universitas|university|\bsma\b|\bsmk\b|sarjana|diploma/.test(t);
  const adaKeahlian = /keahlian|\bskills?\b|kemampuan|kompetensi/.test(t);
  const bagian = [adaPengalaman, adaPendidikan, adaKeahlian].filter(Boolean).length;

  const jumlahAngka = countResultNumbers(text);

  const id = t.match(/\b(dan|yang|dengan|untuk|dari|dalam|pada|adalah|sebagai|pengalaman|pendidikan|keahlian|kerja|saya)\b/g) ?? [];
  const en = t.match(/\b(and|the|with|for|from|experience|education|skills|work|team|managed|developed)\b/g) ?? [];

  const skillKetemu = SKILL_KERJA.filter((k) => t.includes(k));

  const bahasaCampur = id.length + en.length >= 3 && id.length < en.length * 2 && en.length < id.length * 2;
  const dominanIndonesia = id.length >= en.length;

  const poin: { id: CriterionId; status: Status; catatan: string }[] = [
    {
      id: "kontak",
      status: email && telp ? "ya" : email || telp ? "ragu" : "tidak",
      catatan: email && telp ? "Email dan nomor HP terbaca." : email || telp ? "Hanya email atau nomor yang terbaca." : "Email atau nomor HP tidak terbaca.",
    },
    { id: "kolom", status: "ragu", catatan: "Tata letak tak bisa dipastikan dari teks." },
    { id: "font", status: "ragu", catatan: "Jenis font tak terbaca dari teks." },
    {
      id: "judul",
      status: bagian >= 3 ? "ya" : bagian === 2 ? "ragu" : "tidak",
      catatan: bagian >= 3 ? "Bagian pengalaman, pendidikan, keahlian ada." : bagian === 2 ? "Satu bagian utama belum ada." : "Judul bagian belum lengkap.",
    },
    {
      id: "angka",
      status: jumlahAngka >= 2 ? "ya" : "tidak",
      catatan: jumlahAngka >= 2 ? "Menyebut angka hasil kerja." : "Tambahkan angka hasil kerja.",
    },
    { id: "keyword", status: "ragu", catatan: "Kecocokan lowongan perlu info tambahan." },
    {
      id: "bahasa",
      status: id.length + en.length < 3 ? "ragu" : bahasaCampur ? "tidak" : "ya",
      catatan: id.length + en.length < 3 ? "Bahasa sulit dipastikan." : bahasaCampur ? "Bahasa campur Indonesia dan Inggris." : dominanIndonesia ? "Bahasa Indonesia konsisten." : "Bahasa Inggris konsisten.",
    },
    {
      id: "halaman",
      status: pages >= 1 && pages <= 2 ? "ya" : "tidak",
      catatan: pages < 1 ? "Jumlah halaman tak terbaca." : pages <= 2 ? `Rapi: ${pages} halaman.` : `Terlalu panjang: ${pages} halaman.`,
    },
    { id: "format", status: "ya", catatan: "File PDF valid." },
    {
      id: "skill",
      status: skillKetemu.length > 0 ? "ya" : "tidak",
      catatan: skillKetemu.length > 0 ? `Skill teknis: ${skillKetemu.slice(0, 3).join(", ")}.` : "Tulis skill teknis yang spesifik.",
    },
  ];

  const ya = poin.filter((p) => p.status === "ya").length;
  const skor = Math.round((ya / poin.length) * 100);
  const ringkasan =
    skor < 50
      ? `Penilaian otomatis ${skor}/100: perlu banyak perbaikan sebelum dikirim.`
      : skor < 80
        ? `Penilaian otomatis ${skor}/100: poles bagian yang belum terisi.`
        : `Penilaian otomatis ${skor}/100: siap kirim dengan sedikit polesan.`;
  return { ringkasan, poin };
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "File terlalu besar." }, { status: 413 });
  }
  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? "").slice(0, MAX_CHARS).trim();
  const pages = clampPages(body?.pages);
  if (text.length < 50) {
    return NextResponse.json({ error: "Teks CV terlalu pendek atau gagal dibaca dari PDF." }, { status: 400 });
  }

  // Gratis: tanpa API key, nilai langsung di server ini (hasil "Penilaian otomatis").
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(nilaiLokal(text, pages));
  }

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
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
    const status: Status = p.status === "ya" || p.status === "tidak" ? p.status : "ragu";
    return { id, status, catatan: String(p.catatan ?? "").slice(0, 120) };
  });
  return NextResponse.json({ ringkasan: String(parsed.ringkasan ?? "").slice(0, 200), poin });
}
