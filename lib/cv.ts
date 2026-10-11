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
