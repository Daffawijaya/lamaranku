import Link from "next/link";
import CvBuilderClient from "./CvBuilderClient";
import { pageMetadata, featureSchema } from "../../lib/seo";
import { StructuredData } from "../../components/seo/StructuredData";

const description = "Buat CV ATS gratis online dengan CV builder Lamaranku. Pilih template ATS atau kreatif, isi data, lihat preview A4, dan unduh PDF. Basic menyimpan 2 CV.";
export const metadata = pageMetadata("/cv-builder", "CV Builder Gratis: Buat CV ATS Online & Unduh PDF", description);

export default function CvBuilderPage() {
  return (
    <>
      <StructuredData data={featureSchema("/cv-builder", "CV Builder Lamaranku", description)} />
      <CvBuilderClient>
        <section className="bg-zinc-100 px-5 py-16 sm:py-20" aria-labelledby="cv-builder-guide">
          <div className="mx-auto max-w-[1056px]">
            <h2 id="cv-builder-guide" className="text-3xl font-bold tracking-tight">Bikin CV online: pilih template, tulis bukti, lalu unduh PDF.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">CV builder membantu menyusun informasi lamaran tanpa mengatur tata letak dari awal. Untuk melamar melalui portal rekrutmen, mulai dari template ATS satu kolom seperti Harvard atau Adelaide. Template kreatif tersedia jika posisi tujuan membutuhkan tampilan yang lebih visual.</p>
            <ol className="mt-9 grid gap-4 md:grid-cols-3">
              {[
                ["1. Pilih model CV", "Bandingkan template ATS dan kreatif di atas. Empat template tersedia di Basic; enam template premium ditandai ikon mahkota."],
                ["2. Isi pengalamanmu", "Masuk ke dashboard lalu isi profil, pengalaman, pendidikan, dan keahlian. Preview memakai ukuran A4 dan mendukung beberapa halaman."],
                ["3. Simpan sebagai PDF", "Tekan Unduh PDF lalu pilih simpan sebagai PDF pada dialog cetak browser. Periksa kembali isi dan urutan halaman sebelum mengirim."],
              ].map(([title, text]) => <li key={title} className="rounded-2xl bg-white p-6"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 leading-7 text-zinc-600">{text}</p></li>)}
            </ol>
            <div className="mt-9 grid gap-8 md:grid-cols-2">
              <div><h3 className="text-xl font-bold">Apakah CV ATS pasti lolos seleksi?</h3><p className="mt-3 leading-7 text-zinc-600">Tidak. Struktur sederhana membantu keterbacaan, tetapi persyaratan pekerjaan dan bukti pengalaman tetap menentukan. Hindari menambah kata kunci atau angka pencapaian yang tidak sesuai fakta. Baca <Link href="/cv-ats" className="font-semibold text-[#3b63fb] underline underline-offset-4">panduan membuat CV ATS</Link> sebelum memilih format.</p></div>
              <div><h3 className="text-xl font-bold">Apa batas CV builder gratis?</h3><p className="mt-3 leading-7 text-zinc-600">Basic menyediakan dua CV tersimpan di browser dan hasil dengan cap contoh. Plus membuka template premium dan unduhan tanpa cap. Lihat <Link href="/harga" className="font-semibold text-[#3b63fb] underline underline-offset-4">rincian paket</Link> untuk membandingkan batasnya.</p></div>
            </div>
            <p className="mt-9 leading-7 text-zinc-600">Sudah punya dokumen? Gunakan <Link href="/skor" className="font-semibold text-[#3b63fb] underline underline-offset-4">review CV dengan AI</Link> untuk mendapatkan saran berbukti. Lengkapi lamaran dengan <Link href="/portfolio" className="font-semibold text-[#3b63fb] underline underline-offset-4">portofolio gratis</Link> dan <Link href="/surat" className="font-semibold text-[#3b63fb] underline underline-offset-4">surat lamaran kerja</Link>.</p>
          </div>
        </section>
      </CvBuilderClient>
    </>
  );
}
