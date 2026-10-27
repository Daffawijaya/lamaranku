import Link from "next/link";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { StructuredData } from "../../components/seo/StructuredData";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";
import { featureSchema, pageMetadata } from "../../lib/seo";

const description = "Buat portofolio gratis secara online. Susun profil dan karya, simpan di browser, lalu unduh PDF untuk melengkapi lamaran kerja.";
export const metadata = pageMetadata("/portfolio", "Buat Portofolio Gratis Online & Unduh PDF", description);


export default function PortfolioPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <StructuredData data={featureSchema("/portfolio", "Portfolio Builder Lamaranku", description)} />
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Portfolio Builder"
              title="Buat Portofolio Gratis untuk Lamaran Kerja"
              description="Susun profil dan karya secara online, lihat pratinjau, lalu unduh PDF. Mulai dari proyek yang sudah kamu punya untuk melengkapi lamaran kerja."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <div className="flex justify-center">
              <Link href="/dashboard/portfolio" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b63fb] px-7 py-3 font-bold text-white hover:bg-[#274dea]">Mulai buat portofolio gratis</Link>
            </div>
            <article className="mx-auto mt-14 max-w-[1120px] space-y-12">
              <section aria-labelledby="cara-buat-portofolio">
                <h2 id="cara-buat-portofolio" className="text-2xl font-bold tracking-tight sm:text-3xl">Cara menyusun portofolio yang jelas</h2>
                <p className="mt-4 max-w-[820px] leading-7 text-zinc-700">
                  Portofolio memberi contoh nyata dari kemampuan yang kamu tulis di CV. Pilih karya yang berhubungan dengan posisi tujuan, bukan sekadar mengumpulkan semua pekerjaan. Jelaskan konteksnya agar perekrut memahami bagian yang kamu kerjakan sendiri.
                </p>
                <ol className="mt-6 grid gap-5 md:grid-cols-3">
                  <li className="rounded-2xl bg-zinc-100 p-6">
                    <h3 className="text-lg font-bold">1. Lengkapi profil</h3>
                    <p className="mt-3 leading-7 text-zinc-700">Isi nama, peran, bio singkat, kontak, dan keahlian. Tulis fokus pekerjaanmu dengan bahasa yang mudah dipahami. Pastikan email serta tautan pendukung sudah benar sebelum portofolio dikirim.</p>
                  </li>
                  <li className="rounded-2xl bg-zinc-100 p-6">
                    <h3 className="text-lg font-bold">2. Ceritakan karya pilihan</h3>
                    <p className="mt-3 leading-7 text-zinc-700">Tambahkan judul proyek, deskripsi, dan tautan jika tersedia. Jelaskan masalah, tugasmu, serta hasil yang dapat ditunjukkan. Gunakan angka hanya jika ada datanya; jangan mengarang capaian untuk membuat proyek terlihat besar.</p>
                  </li>
                  <li className="rounded-2xl bg-zinc-100 p-6">
                    <h3 className="text-lg font-bold">3. Periksa dan unduh PDF</h3>
                    <p className="mt-3 leading-7 text-zinc-700">Lihat preview, simpan pekerjaanmu, lalu pilih Unduh PDF. Pada dialog cetak browser, pilih simpan sebagai PDF. Buka hasil unduhan untuk memeriksa isi dan pergantian halaman sebelum melampirkannya.</p>
                  </li>
                </ol>
              </section>
              <section aria-labelledby="contoh-isi-portofolio">
                <h2 id="contoh-isi-portofolio" className="text-2xl font-bold tracking-tight sm:text-3xl">Mulai dari pengalaman yang kamu punya</h2>
                <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-zinc-700">
                  <li><strong>Fresh graduate:</strong> pilih proyek kuliah, magang, atau organisasi. Jelaskan tanggung jawab dan hasil kerja yang benar-benar kamu kerjakan.</li>
                  <li><strong>Desainer:</strong> ceritakan tujuan desain, peranmu, dan alasan memilih pendekatan tersebut. Tambahkan tautan karya yang boleh dibagikan.</li>
                  <li><strong>Developer:</strong> jelaskan fungsi aplikasi, teknologi yang digunakan, serta bagian implementasimu. Sertakan tautan demo atau repositori yang memang dapat diakses.</li>
                </ul>
              </section>
              <section aria-labelledby="pertanyaan-portofolio" className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
                <h2 id="pertanyaan-portofolio" className="text-2xl font-bold tracking-tight sm:text-3xl">Sebelum mulai membuat portofolio</h2>
                <dl className="mt-5 space-y-5 leading-7 text-zinc-700">
                  <div><dt className="font-bold text-zinc-900">Perlu masuk ke akun?</dt><dd>Ya. Masuk atau buat akun untuk membuka editor portofolio di dashboard.</dd></div>
                  <div><dt className="font-bold text-zinc-900">Di mana simpanannya?</dt><dd>Data tersimpan di browser yang kamu gunakan. Menghapus data browser atau berpindah perangkat dapat membuat simpanan tidak tersedia. Unduh PDF sebagai salinan.</dd></div>
                  <div><dt className="font-bold text-zinc-900">Apakah langsung mendapat link portofolio online?</dt><dd>Belum. Saat ini hasilnya berupa PDF; penerbitan link portofolio online belum tersedia.</dd></div>
                </dl>
              </section>
              <p className="leading-7 text-zinc-700">
                Lengkapi berkasmu dengan <Link href="/cv-builder" className="font-semibold text-[#3b63fb] underline underline-offset-4">CV builder</Link>, baca <Link href="/cv-ats" className="font-semibold text-[#3b63fb] underline underline-offset-4">panduan CV ATS</Link>, dan susun <Link href="/surat" className="font-semibold text-[#3b63fb] underline underline-offset-4">surat lamaran</Link> sesuai posisi tujuan.
              </p>
            </article>
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title="Mau link online lamaranku.id/nama?"
          description={`Link online dan masa aktif 6 bulan menyusul di Plus ${PLUS_PRICE}. Harga awal, konfirmasi WA sebelum bayar.`}
          primary={{ label: "Minta info Plus", href: wa("Halo Lamaranku, saya mau info link portfolio Plus"), external: true }}
          secondary={{ label: "Lihat harga", href: "/harga" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
