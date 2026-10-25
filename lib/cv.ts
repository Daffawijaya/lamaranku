import type { TemplateId } from "../data/templates";
import { TEMPLATES } from "../data/templates";

export interface Experience {
  jabatan: string;
  perusahaan: string;
  periode: string;
  deskripsi: string;
}

export interface Education {
  gelar: string;
  sekolah: string;
  tahun: string;
}

export interface CvData {
  nama: string;
  posisi: string;
  email: string;
  telepon: string;
  alamat: string;
  ringkasan: string;
  pengalaman: Experience[];
  pendidikan: Education[];
  keahlian: string;
  templateId: TemplateId;
}

export interface SavedCv {
  id: string;
  judul: string;
  updatedAt: string;
  data: CvData;
}

export const DEFAULT_CV: CvData = {
  nama: "Ridwan",
  posisi: "Staff Administrasi",
  email: "ridwan.contoh@email.com",
  telepon: "0812-0000-0000",
  alamat: "Malang, Jawa Timur",
  ringkasan: "Dua tahun mengelola arsip dan laporan Excel di koperasi dan kantor notaris. Rapi, teliti, terbiasa target bulanan dan koordinasi lintas tim.",
  pengalaman: [
    {
      jabatan: "Staff Administrasi",
      perusahaan: "Koperasi Maju Bersama",
      periode: "2024 - Sekarang",
      deskripsi: "Menata 500+ berkas arsip, menyusun laporan Excel bulanan, dan membantu administrasi keanggotaan."
    },
    {
      jabatan: "Asisten Arsip",
      perusahaan: "Kantor Notaris Hartono",
      periode: "2023 - 2024",
      deskripsi: "Membantu penataan 300+ berkas akta dan entri data klien ke spreadsheet."
    }
  ],
  pendidikan: [
    { gelar: "SMK Administrasi Perkantoran", sekolah: "SMK Negeri 1 Malang", tahun: "2023" },
    { gelar: "Pelatihan Komputer Perkantoran", sekolah: "LPK Cendekia Malang", tahun: "2024" }
  ],
  keahlian: "Microsoft Excel, Pengarsipan digital, Surat-menyurat, Entri data, Komunikasi",
  templateId: "harvard"
};

export const CV_STORAGE_KEY = "lamaranku_cvs";
export const PLUS_STORAGE_KEY = "lamaranku_plus";

const templateIds = new Set<string>(TEMPLATES.map((t) => t.id));

function isCvData(value: unknown): value is CvData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.nama === "string" &&
    typeof v.posisi === "string" &&
    typeof v.email === "string" &&
    typeof v.telepon === "string" &&
    typeof v.alamat === "string" &&
    typeof v.ringkasan === "string" &&
    Array.isArray(v.pengalaman) && v.pengalaman.every(item => hasStrings(item, ["jabatan", "perusahaan", "periode", "deskripsi"])) &&
    Array.isArray(v.pendidikan) && v.pendidikan.every(item => hasStrings(item, ["gelar", "sekolah", "tahun"])) &&
    typeof v.keahlian === "string" &&
    typeof v.templateId === "string" &&
    templateIds.has(v.templateId)
  );
}

function hasStrings(value: unknown, keys: string[]): boolean {
  return typeof value === "object" && value !== null &&
    keys.every(key => typeof (value as Record<string, unknown>)[key] === "string");
}

function isSavedCv(value: unknown): value is SavedCv {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.judul === "string" && typeof v.updatedAt === "string" && isCvData(v.data);
}

export function loadSaved(): SavedCv[] {
  try {
    const raw = localStorage.getItem(CV_STORAGE_KEY);
    if (!raw) return [];
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(isSavedCv);
  } catch {
    return [];
  }
}

export function storeSaved(list: SavedCv[]) {
  try {
    localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(list));
  } catch {
    throw new Error("CV belum tersimpan. Penyimpanan browser penuh atau diblokir. Unduh PDF untuk menyimpan salinan.");
  }
}

export function isPlus(): boolean {
  try {
    return localStorage.getItem(PLUS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function cloneCv(data: CvData): CvData {
  if (typeof structuredClone === "function") return structuredClone(data);
  return JSON.parse(JSON.stringify(data)) as CvData;
}

export function newCvId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return `cv-${crypto.randomUUID()}`;
  return `cv-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
