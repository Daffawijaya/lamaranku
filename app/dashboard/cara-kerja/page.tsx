import Link from "next/link";
import { FileText, ScanText, BriefcaseBusiness, Mail, ArrowUpRight } from "lucide-react";
import { T } from "../../../components/i18n/LanguageProvider";

const guides = [
  { title: "Buat CV", icon: FileText, href: "/dashboard/cv-builder", action: "Buka Pembuat CV", steps: ["Pilih template yang sesuai dengan kebutuhan lamaranmu.", "Lengkapi data diri, pengalaman, pendidikan, dan keahlian.", "Periksa pratinjau, simpan dokumen, lalu unduh PDF."] },
  { title: "Review CV", icon: ScanText, href: "/dashboard/skor", action: "Review CV sekarang", steps: ["Unggah CV dalam format PDF, maksimal 5 MB.", "Tambahkan deskripsi lowongan jika ingin menilai kecocokan posisi.", "Jalankan review, lalu gunakan skor dan saran untuk memperbaiki CV."] },
  { title: "Susun portofolio", icon: BriefcaseBusiness, href: "/dashboard/portfolio", action: "Buka Portofolio", steps: ["Isi nama, peran, bio, dan informasi kontak.", "Tambahkan karya, deskripsi, serta tautan yang relevan.", "Simpan portofolio atau gunakan Unduh PDF untuk membagikannya."] },
  { title: "Tulis surat lamaran", icon: Mail, href: "/dashboard/surat", action: "Buka Surat lamaran", steps: ["Masukkan nama pengirim, perusahaan tujuan, dan posisi yang dilamar.", "Periksa ejaan nama dan isi bacaan surat.", "Klik Buat surat untuk menggunakan kuota surat lamaran."] },
];

export default function DashboardGuidePage() {
  return <div className="dashboard-info">
    <p className="dashboard-info-intro"><T text="Siapkan dokumen lamaranmu dengan empat alat Lamaranku. Pilih bagian yang ingin kamu kerjakan." /></p>
    <div className="dashboard-info-grid">{guides.map(guide => <section className="dash-ui-card dashboard-guide" key={guide.href} aria-labelledby={`guide-${guide.href.split("/").pop()}`}>
      <div className="dashboard-info-heading"><h2 id={`guide-${guide.href.split("/").pop()}`}><guide.icon size={19} aria-hidden="true" /><T text={guide.title} /></h2></div>
      <ol>{guide.steps.map(step => <li key={step}><T text={step} /></li>)}</ol>
      <Link href={guide.href} scroll={false} className="dash-ui-button"><T text={guide.action} /><ArrowUpRight size={15} aria-hidden="true" /></Link>
    </section>)}</div>
    <section className="dash-ui-card dashboard-info-faq" aria-labelledby="dashboard-guide-faq"><h2 id="dashboard-guide-faq"><T text="Hal yang perlu diketahui" /></h2>
      <details open><summary><T text="Di mana dokumen saya disimpan?" /></summary><p><T text="Draft dan dokumen tersimpan di browser untuk akun yang digunakan. Gunakan perangkat yang sama untuk melanjutkan, dan unduh salinan PDF sebelum menghapus data browser." /></p></details>
      <details><summary><T text="Apakah isi CV hilang saat mengganti template?" /></summary><p><T text="Tidak. Data yang sudah kamu isi tetap dipertahankan saat mengganti template." /></p></details>
      <details><summary><T text="Bagaimana mengganti tampilan dashboard?" /></summary><p><T text="Gunakan menu Tampilan untuk berganti mode terang dan gelap. Penyesuaian warna dan font tersedia di Pengaturan." /></p></details>
      <details><summary><T text="Apa perbedaan Basic dan Plus?" /></summary><p><Link href="/dashboard/paket" scroll={false}><T text="Lihat perbandingan paket dan fitur" /></Link></p></details>
    </section>
  </div>;
}
