export type CellValue = string | boolean;

export interface FeatureRow {
  fitur: string;
  deskripsi: string;
  basic: CellValue;
  plus: CellValue;
  paywallMoment?: string;
}

export interface FeatureSection {
  id: string;
  title: string;
  rows: FeatureRow[];
}

export const PLUS_PRICE = "Rp29rb/bulan";
export const WA_NUMBER = "6280000000000";

export const sections: FeatureSection[] = [
  {
    id: "cv-builder",
    title: "CV Builder",
    rows: [
      {
        fitur: "Maksimal CV",
        deskripsi: "Jumlah CV yang bisa kamu simpan di akun.",
        basic: "2 CV",
        plus: "Unlimited"
      },
      {
        fitur: "AI Fix Content CV",
        deskripsi: "AI merapikan & memperkuat kalimat di CV agar lebih profesional.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Perbaiki dengan AI"
      },
      {
        fitur: "AI Rekomendasi Frasa",
        deskripsi: "Saran frasa & bullet point siap pakai sesuai posisi yang dituju.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Minta Saran Frasa"
      },
      {
        fitur: "Download tanpa watermark",
        deskripsi: "Unduh CV dalam PDF bersih tanpa logo Lamaranku.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Download PDF"
      }
    ]
  },
  {
    id: "cek-skor",
    title: "Cek Skor CV",
    rows: [
      {
        fitur: "Jumlah pengecekan",
        deskripsi: "Batas cek skor CV per bulan.",
        basic: "3/bulan",
        plus: "Unlimited"
      },
      {
        fitur: "Skor ATS dan kecocokan",
        deskripsi: "Nilai kecocokan CV terhadap syarat lowongan.",
        basic: true,
        plus: true
      },
      {
        fitur: "Rincian per bagian",
        deskripsi: "Bedah skor per bagian: struktur, keyword, pengalaman, dan skill.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Lihat Rincian"
      },
      {
        fitur: "Rekomendasi perbaikan",
        deskripsi: "Saran konkret untuk menaikkan skor.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Minta Saran"
      }
    ]
  },
  {
    id: "portfolio-builder",
    title: "Portfolio Builder",
    rows: [
      {
        fitur: "Download PDF",
        deskripsi: "Unduh portofolio sebagai file PDF untuk dibagikan offline.",
        basic: true,
        plus: true
      },
      {
        fitur: "Website portofolio",
        deskripsi: "Website portofolio online yang bisa dibagikan via link.",
        basic: false,
        plus: true
      },
      {
        fitur: "Masa aktif website",
        deskripsi: "Durasi website portofolio kamu aktif dan bisa diakses publik.",
        basic: false,
        plus: "Selama Plus aktif"
      },
      {
        fitur: "Custom link website",
        deskripsi: "Gunakan alamat unikmu sendiri, misal: lamaranku.id/p/ridwan.",
        basic: false,
        plus: true,
        paywallMoment: "Saat klaim link custom"
      },
      {
        fitur: "Maksimal visitor website",
        deskripsi: "Jumlah pengunjung unik yang bisa membuka website portofoliomu per bulan.",
        basic: false,
        plus: "Unlimited"
      },
      {
        fitur: "AI deskripsi karya",
        deskripsi: "Ubah catatan kasar jadi deskripsi karya yang rapi untuk portofolio.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Buat Deskripsi"
      }
    ]
  },
  {
    id: "generator-surat",
    title: "Generator Surat",
    rows: [
      {
        fitur: "Jumlah Surat",
        deskripsi: "Batas surat yang bisa dibuat per bulan.",
        basic: "3/bulan",
        plus: "Unlimited"
      },
      {
        fitur: "Download tanpa watermark",
        deskripsi: "Unduh surat dalam PDF bersih tanpa logo Lamaranku.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Download PDF"
      }
    ]
  },
];
