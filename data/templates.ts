export type TemplateKind = "ats" | "kreatif";

export type TemplateId =
  | "harvard"
  | "adelaide"
  | "structura"
  | "columbia"
  | "munich"
  | "oxford"
  | "minimalist"
  | "corporate"
  | "bold-impact"
  | "geo-flow";

export interface CvTemplate {
  id: TemplateId;
  name: string;
  kind: TemplateKind;
  desc: string;
  plusOnly: boolean;
}

export const TEMPLATES: CvTemplate[] = [
  { id: "harvard", name: "Harvard", kind: "ats", desc: "Satu kolom serif, judul tengah, sekat garis. Pilihan aman untuk BUMN dan bank.", plusOnly: false },
  { id: "adelaide", name: "Adelaide", kind: "ats", desc: "Sans rapat, baris kontak jelas, judul bagian bergaris bawah.", plusOnly: false },
  { id: "structura", name: "Structura", kind: "ats", desc: "Label tebal sebaris, padat satu halaman untuk fresh graduate.", plusOnly: false },
  { id: "columbia", name: "Columbia", kind: "ats", desc: "Nama besar rata kiri, ringkas, pengalaman di depan.", plusOnly: true },
  { id: "munich", name: "Munich", kind: "ats", desc: "Ruang lega, garis tipis, enak dibaca cepat oleh HRD.", plusOnly: true },
  { id: "oxford", name: "Oxford", kind: "ats", desc: "Serif formal dua tingkat judul, untuk posisi akademik dan struktural.", plusOnly: true },
  { id: "minimalist", name: "Minimalist", kind: "kreatif", desc: "Bilah sisi hijau materai, inisial foto, daftar skill jelas.", plusOnly: false },
  { id: "corporate", name: "Corporate", kind: "kreatif", desc: "Kepala tinta penuh, isi dua kolom untuk yang berpengalaman.", plusOnly: true },
  { id: "bold-impact", name: "Bold Impact", kind: "kreatif", desc: "Nama besar plus bilah aksen merah, untuk posisi media dan pemasaran.", plusOnly: true },
  { id: "geo-flow", name: "Geo Flow", kind: "kreatif", desc: "Kepala miring asimetris, untuk portofolio desain dan konten.", plusOnly: true }
];

export const templateById = (id: string): CvTemplate =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
