import { accountStorageKey } from "./account-storage";
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

export interface CvProject {
  nama: string;
  peran: string;
  periode: string;
  deskripsi: string;
}

export interface Certification {
  nama: string;
  penerbit: string;
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
  website?: string;
  proyek?: CvProject[];
  hardSkills?: string;
  softSkills?: string;
  sertifikasi?: Certification[];
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

export function isCvData(value: unknown): value is CvData {
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
    (v.website === undefined || typeof v.website === "string") &&
    (v.hardSkills === undefined || typeof v.hardSkills === "string") &&
    (v.softSkills === undefined || typeof v.softSkills === "string") &&
    (v.proyek === undefined || (Array.isArray(v.proyek) && v.proyek.every(item => hasStrings(item, ["nama", "peran", "periode", "deskripsi"])))) &&
    (v.sertifikasi === undefined || (Array.isArray(v.sertifikasi) && v.sertifikasi.every(item => hasStrings(item, ["nama", "penerbit", "tahun"])))) &&
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

export function loadSaved(userId?: string | null): SavedCv[] {
  try {
    const raw = localStorage.getItem(accountStorageKey(CV_STORAGE_KEY, userId));
    if (!raw) return [];
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(isSavedCv);
  } catch {
    return [];
  }
}

export function storeSaved(list: SavedCv[], userId?: string | null) {
  try {
    localStorage.setItem(accountStorageKey(CV_STORAGE_KEY, userId), JSON.stringify(list));
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

// Keep DEFAULT_CV for public template demonstrations only.
export function emptyCv(templateId: CvData["templateId"] = "harvard"): CvData {
  return { nama: "", posisi: "", email: "", telepon: "", alamat: "", ringkasan: "", pengalaman: [], pendidikan: [], keahlian: "", templateId };
}
