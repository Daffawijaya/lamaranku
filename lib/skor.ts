export const CRITERIA = [
  { id: "kontak", t: "Kontak dan identitas", d: "Kontak yang terbaca dan identitas profesional.", weight: 8 },
  { id: "struktur", t: "Struktur dan kelengkapan", d: "Bagian yang relevan dengan tahap karier.", weight: 12 },
  { id: "ringkasan", t: "Profil profesional", d: "Fokus, kompetensi, dan nilai yang ditawarkan.", weight: 8 },
  { id: "pengalaman", t: "Kualitas pengalaman", d: "Kontribusi, tanggung jawab, proyek, atau magang yang jelas.", weight: 18 },
  { id: "dampak", t: "Bukti dan dampak", d: "Hasil nyata; angka hanya dihitung jika menjelaskan kontribusi.", weight: 15 },
  { id: "relevansi", t: "Kecocokan lowongan", d: "Bukti terhadap persyaratan lowongan yang diberikan.", weight: 15 },
  { id: "skill", t: "Keahlian dan bukti", d: "Keahlian spesifik beserta penerapannya.", weight: 10 },
  { id: "pendidikan", t: "Pendidikan dan kualifikasi", d: "Pendidikan, pelatihan, atau sertifikasi yang relevan.", weight: 5 },
  { id: "bahasa", t: "Kejelasan bahasa", d: "Kalimat efektif, konsistensi, dan ketepatan istilah.", weight: 5 },
  { id: "keterbacaan", t: "Keterbacaan teks PDF", d: "Urutan teks, kepadatan, dan panjang sesuai konteks.", weight: 4 },
] as const;
export type Point = { id: string; status: "ya" | "tidak" | "ragu"; nilai: number | null; catatan: string; bukti: string; saran: string };
export type Review = { ringkasan: string; poin: Point[]; kekuatan: string[]; prioritas: { masalah: string; tindakan: string; dampak: string }[]; revisi: { sebelum: string; sesudah: string; alasan: string }[]; kecocokan: { terpenuhi: string[]; belumTerbukti: string[] }; batasan: string[]; score: number; model: string };
export function calculateScore(points: Point[]) {
  let total = 0, weights = 0;
  for (const c of CRITERIA) {
    const p = points.find(p => p.id === c.id);
    if (p && p.nilai !== null) { total += p.nilai * c.weight; weights += c.weight; }
  }
  return weights ? Math.round(total / weights) : 0;
}
export function validateReview(value: unknown, text: string, hasJob: boolean): Omit<Review, "score" | "model"> {
  const v = value as Review;
  const str = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0 && x.length <= 4000;
  const list = (x: unknown): x is string[] => Array.isArray(x) && x.length <= 15 && x.every(str);
  const normalized = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  if (!v || !str(v.ringkasan) || !Array.isArray(v.poin) || v.poin.length !== CRITERIA.length ||
      new Set(v.poin.map(p => p.id)).size !== CRITERIA.length ||
      !CRITERIA.every(c => v.poin.some(p => p.id === c.id)) ||
      !v.poin.every(p => (p.nilai === null || (typeof p.nilai === "number" && Number.isFinite(p.nilai) && p.nilai >= 0 && p.nilai <= 100)) && str(p.catatan) && typeof p.bukti === "string" && str(p.saran)) ||
      !list(v.kekuatan) || !list(v.batasan) || !v.kecocokan || !list(v.kecocokan.terpenuhi) || !list(v.kecocokan.belumTerbukti) ||
      !Array.isArray(v.prioritas) || v.prioritas.length < 1 || v.prioritas.length > 5 || !v.prioritas.every(p => str(p.masalah) && str(p.tindakan) && str(p.dampak)) ||
      !Array.isArray(v.revisi) || v.revisi.length > 5 || !v.revisi.every(r => str(r.sebelum) && str(r.sesudah) && str(r.alasan) && normalized(text).includes(normalized(r.sebelum)))) throw new Error("Review AI tidak lengkap atau kutipan revisinya tidak sesuai CV. Coba lagi.");
  for (const p of v.poin) {
    if (p.bukti && !normalized(text).includes(normalized(p.bukti))) throw new Error("Bukti AI tidak ditemukan dalam CV. Coba lagi.");
    if (p.id === "relevansi" && !hasJob) p.nilai = null;
    p.status = p.nilai === null ? "ragu" : p.nilai >= 75 ? "ya" : "tidak";
  }
  if (!hasJob) v.kecocokan = { terpenuhi: [], belumTerbukti: [] };
  return v;
}
