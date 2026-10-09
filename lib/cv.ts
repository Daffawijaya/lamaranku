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
  templateId: string;
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
  ringkasan: "Satu tahun mengelola arsip dan Excel di koperasi. Rapi, teliti, terbiasa target bulanan.",
  pengalaman: [
    {
      jabatan: "Staff Administrasi",
      perusahaan: "Koperasi Maju Bersama",
      periode: "2024 - Sekarang",
      deskripsi: "Menata 500+ berkas arsip dan menyusun laporan Excel bulanan."
    }
  ],
  pendidikan: [{ gelar: "SMK Administrasi Perkantoran", sekolah: "SMK Negeri 1 Malang", tahun: "2023" }],
  keahlian: "Excel, Arsip, Surat-menyurat, Komunikasi",
  templateId: "harvard"
};

const KEY = "lamaranku_cvs";

export function loadSaved(): SavedCv[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function storeSaved(list: SavedCv[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function isPlus(): boolean {
  try {
    return localStorage.getItem("lamaranku_plus") === "1";
  } catch {
    return false;
  }
}
