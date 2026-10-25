import { normalizeCvQuote, cvQuoteExists } from "./cv-evidence";

export const CRITERIA = [
  {
    id: "kontak",
    t: "Kontak dan identitas",
    d: "Kontak yang terbaca dan identitas profesional.",
    weight: 8,
  },
  {
    id: "struktur",
    t: "Struktur dan kelengkapan",
    d: "Bagian yang relevan dengan tahap karier.",
    weight: 12,
  },
  {
    id: "ringkasan",
    t: "Profil profesional",
    d: "Fokus, kompetensi, dan nilai yang ditawarkan.",
    weight: 8,
  },
  {
    id: "pengalaman",
    t: "Kualitas pengalaman",
    d: "Kontribusi, tanggung jawab, proyek, atau magang yang jelas.",
    weight: 18,
  },
  {
    id: "dampak",
    t: "Bukti dan dampak",
    d: "Hasil nyata; angka hanya dihitung jika menjelaskan kontribusi.",
    weight: 15,
  },
  {
    id: "relevansi",
    t: "Kecocokan lowongan",
    d: "Bukti terhadap persyaratan lowongan yang diberikan.",
    weight: 15,
  },
  {
    id: "skill",
    t: "Keahlian dan bukti",
    d: "Keahlian spesifik beserta penerapannya.",
    weight: 10,
  },
  {
    id: "pendidikan",
    t: "Pendidikan dan kualifikasi",
    d: "Pendidikan, pelatihan, atau sertifikasi yang relevan.",
    weight: 5,
  },
  {
    id: "bahasa",
    t: "Kejelasan bahasa",
    d: "Kalimat efektif, konsistensi, dan ketepatan istilah.",
    weight: 5,
  },
  {
    id: "keterbacaan",
    t: "Keterbacaan teks PDF",
    d: "Urutan teks, kepadatan, dan panjang sesuai konteks.",
    weight: 4,
  },
] as const;
export type Point = {
  id: string;
  status: "ya" | "tidak" | "ragu";
  nilai: number | null;
  catatan: string;
  bukti: string;
  saran: string;
};
export type Review = {
  ringkasan: string;
  poin: Point[];
  kekuatan: string[];
  prioritas: { masalah: string; tindakan: string; dampak: string }[];
  revisi: { sebelum: string; sesudah: string; alasan: string }[];
  kecocokan: { terpenuhi: string[]; belumTerbukti: string[] };
  batasan: string[];
  score: number;
  model: string;
  usedFallback?: boolean;
};
export function calculateScore(points: Point[]) {
  let total = 0,
    weights = 0;
  for (const c of CRITERIA) {
    const p = points.find((p) => p.id === c.id);
    if (p && p.nilai !== null) {
      total += p.nilai * c.weight;
      weights += c.weight;
    }
  }
  return weights ? Math.round(total / weights) : 0;
}
export function validateReview(
  value: unknown,
  text: string,
  hasJob: boolean,
): Omit<Review, "score" | "model"> {
  const record = (item: unknown): item is Record<string, unknown> =>
    typeof item === "object" && item !== null && !Array.isArray(item);
  const str = (item: unknown): item is string =>
    typeof item === "string" && item.trim().length > 0 && item.length <= 4000;
  const fail = (message: string): never => {
    throw new Error("Review AI " + message + ". Silakan coba lagi.");
  };
  if (!record(value)) return fail("tidak berisi objek penilaian yang valid");
  if (!str(value.ringkasan)) return fail("belum memuat ringkasan penilaian");
  if (!Array.isArray(value.poin) || value.poin.length !== CRITERIA.length)
    return fail("belum memuat tepat 10 kriteria penilaian");
  if (!value.poin.every(record))
    return fail("memuat format kriteria yang tidak valid");
  const points = value.poin;
  if (
    new Set(points.map((point) => point.id)).size !== CRITERIA.length ||
    !CRITERIA.every((criterion) =>
      points.some(
        (point: Record<string, unknown>) => point.id === criterion.id,
      ),
    )
  )
    return fail("memuat kriteria duplikat atau ID kriteria yang tidak sesuai");

  const sourceText = normalizeCvQuote(text);
  const poin: Point[] = points.map((point: Record<string, unknown>) => {
    const criterion = CRITERIA.find((item) => item.id === point.id)!;
    if (
      point.nilai !== null &&
      (typeof point.nilai !== "number" ||
        !Number.isFinite(point.nilai) ||
        point.nilai < 0 ||
        point.nilai > 100)
    )
      return fail(`memuat nilai tidak valid pada kriteria ${criterion.t}`);
    if (!str(point.catatan))
      return fail(`belum memuat catatan pada kriteria ${criterion.t}`);
    if (typeof point.bukti !== "string" || point.bukti.length > 4000)
      return fail(
        `memuat format bukti tidak valid pada kriteria ${criterion.t}`,
      );
    if (point.bukti && !cvQuoteExists(point.bukti, sourceText))
      throw new Error(
        `Bukti AI untuk ${criterion.t} tidak ditemukan dalam CV. Silakan coba lagi.`,
      );
    const nilai =
      criterion.id === "relevansi" && !hasJob
        ? null
        : (point.nilai as number | null);
    if (nilai !== null && !str(point.saran))
      return fail(`belum memuat saran pada kriteria ${criterion.t}`);
    return {
      id: criterion.id,
      nilai,
      status: nilai === null ? "ragu" : nilai >= 75 ? "ya" : "tidak",
      catatan: point.catatan,
      bukti: point.bukti,
      saran: str(point.saran)
        ? point.saran
        : criterion.id === "relevansi" && !hasJob
          ? "Tambahkan deskripsi lowongan untuk menilai kecocokan posisi."
          : "Lengkapi informasi terkait kriteria ini agar dapat dinilai.",
    };
  });

  // Optional supporting sections must never change or fabricate criterion scores.
  const warnings: string[] = [];
  const strings = (items: unknown, label: string): string[] => {
    if (!Array.isArray(items)) {
      warnings.push(`${label} tidak tersedia dalam respons AI.`);
      return [];
    }
    const valid = items.filter(str).slice(0, 15);
    if (valid.length !== items.length)
      warnings.push(
        `Sebagian ${label.toLowerCase()} tidak ditampilkan karena formatnya tidak valid.`,
      );
    return valid;
  };
  const kekuatan = strings(value.kekuatan, "Kekuatan CV");
  const batasan = strings(value.batasan, "Batasan analisis");
  const priorities = Array.isArray(value.prioritas) ? value.prioritas : [];
  const prioritas = priorities
    .filter(
      (item): item is { masalah: string; tindakan: string; dampak: string } =>
        record(item) &&
        str(item.masalah) &&
        str(item.tindakan) &&
        str(item.dampak),
    )
    .slice(0, 5);
  if (!Array.isArray(value.prioritas) || prioritas.length !== priorities.length)
    warnings.push(
      "Sebagian prioritas perbaikan tidak tersedia atau tidak ditampilkan karena formatnya tidak valid.",
    );
  const revisions = Array.isArray(value.revisi) ? value.revisi : [];
  const revisi = revisions
    .filter(
      (item): item is { sebelum: string; sesudah: string; alasan: string } =>
        record(item) &&
        str(item.sebelum) &&
        str(item.sesudah) &&
        str(item.alasan) &&
        cvQuoteExists(item.sebelum, sourceText),
    )
    .slice(0, 5);
  if (!Array.isArray(value.revisi) || revisi.length !== revisions.length)
    warnings.push(
      "Sebagian contoh revisi tidak ditampilkan karena kutipan sumber atau formatnya belum dapat diverifikasi.",
    );
  const kecocokan =
    hasJob && record(value.kecocokan)
      ? {
          terpenuhi: strings(
            value.kecocokan.terpenuhi,
            "Kecocokan yang terpenuhi",
          ),
          belumTerbukti: strings(
            value.kecocokan.belumTerbukti,
            "Kecocokan yang belum terbukti",
          ),
        }
      : { terpenuhi: [], belumTerbukti: [] };
  if (hasJob && !record(value.kecocokan))
    warnings.push(
      "Rincian kecocokan lowongan tidak tersedia dalam respons AI.",
    );
  return {
    ringkasan: value.ringkasan,
    poin,
    kekuatan,
    prioritas,
    revisi,
    kecocokan,
    batasan: [...batasan, ...warnings],
  };
}
