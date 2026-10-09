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
        fitur: "AI Review CV",
        deskripsi: "Analisis CV terhadap sistem ATS beserta skor kecocokan lowongan.",
        basic: false,
        plus: true,
        paywallMoment: "Klik Cek Skor ATS"
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
  {
    id: "portfolio-website",
    title: "Portfolio Website",
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
        basic: true,
        plus: true
      },
      {
        fitur: "Masa aktif website",
        deskripsi: "Durasi website portofolio kamu aktif dan bisa diakses publik.",
        basic: "3 bulan",
        plus: "6 bulan"
      },
      {
        fitur: "Custom link website",
        deskripsi: "Gunakan URL unikmu sendiri, misal: lamaranku.id/ridwan.",
        basic: false,
        plus: true,
        paywallMoment: "Saat klaim link custom"
      },
      {
        fitur: "Maksimal visitor website",
        deskripsi: "Jumlah pengunjung unik yang bisa membuka website portofoliomu per bulan.",
        basic: "100/bulan",
        plus: "Unlimited"
      }
    ]
  },
  {
    id: "career-academy",
    title: "Career Academy",
    rows: [
      {
        fitur: "Kelas aktif bersamaan",
        deskripsi: "Jumlah kelas yang bisa kamu ikuti secara bersamaan.",
        basic: "2 kelas",
        plus: "Unlimited"
      },
      {
        fitur: "Sertifikat",
        deskripsi: "Sertifikat resmi setelah menyelesaikan kelas.",
        basic: false,
        plus: true,
        paywallMoment: "Saat unduh sertifikat"
      }
    ]
  }
];
