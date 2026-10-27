import Link from "next/link";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata(
  "/cv-ats",
  "Buat CV ATS Gratis untuk Lamaran Kerja",
  "Bikin CV ATS dengan template satu kolom, panduan isi pengalaman, dan checklist sebelum mengirim. Simpan 2 CV gratis di Lamaranku, lalu unduh PDF.",
);

const steps = [
  {
    title: "Pilih template satu kolom",
    text: "Mulai dari Harvard, Adelaide, atau Structura di galeri template ATS. Pilih berdasarkan susunan informasi yang paling nyaman dibaca. Desain yang sederhana membantu kamu menonjolkan isi, tanpa harus menghabiskan waktu mengatur posisi setiap elemen.",
  },
  {
    title: "Lengkapi profil dan kontak",
    text: "Tulis nama, posisi yang dituju, email, nomor telepon, dan kota domisili. Gunakan kontak yang aktif. Ringkasan profil cukup menjelaskan bidang, pengalaman yang relevan, dan kemampuan utama; hindari kalimat umum yang tidak memberi informasi baru.",
  },
  {
    title: "Sesuaikan isi dengan lowongan",
    text: "Baca persyaratan posisi sebelum memilih pengalaman, proyek, dan keahlian yang ingin ditampilkan. Gunakan istilah dari lowongan jika sesuai dengan kemampuanmu. Jangan menambahkan teknologi, jabatan, sertifikat, atau capaian yang belum pernah kamu miliki hanya untuk mengejar kata kunci.",
  },
  {
    title: "Periksa preview, simpan, lalu unduh",
    text: "Lihat pratinjau untuk memeriksa urutan bagian, pergantian halaman, dan kesalahan ketik. Simpan pekerjaanmu di browser, lalu tekan Unduh PDF dan pilih simpan sebagai PDF pada dialog cetak. Buka kembali hasilnya sebelum dikirim, termasuk untuk memastikan teksnya dapat dipilih dan disalin.",
  },
];

const checklist = [
  "Nama posisi, perusahaan, serta periode pengalaman ditulis dengan konsisten.",
  "Bagian pengalaman, pendidikan, dan keahlian mempunyai judul yang mudah dikenali.",
  "Email dan nomor telepon sudah diperiksa ulang, tanpa data pribadi yang tidak diperlukan.",
  "Setiap keterampilan atau angka dalam CV dapat dijelaskan dengan pengalaman nyata.",
  "Isi mengikuti persyaratan lowongan, termasuk bahasa dan format berkas yang diminta.",
  "PDF tidak terpotong, tidak berisi halaman kosong tambahan, dan teksnya tetap terbaca.",
];

export default function CvAtsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <Navbar />
      <main>
        <section className="px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-[1120px]">
            <PageIntro
              label="Panduan CV ATS"
              title="Buat CV ATS Gratis untuk Lamaran Kerja"
              description="Mulai dari template satu kolom, isi pengalaman yang relevan, lalu unduh PDF. Panduan ini membantu kamu menyusun CV yang jelas untuk dibaca sistem dan perekrut."
              titleClassName="max-w-[800px]"
              descriptionClassName="max-w-[740px]"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cv-builder?kind=ats" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b63fb] px-7 py-3 font-bold text-white hover:bg-[#274dea]">
                Pilih template CV ATS
              </Link>
              <Link href="/cv-builder?template=harvard" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-zinc-900 px-7 py-3 font-bold hover:bg-zinc-900 hover:text-white">
                Mulai dengan Harvard
              </Link>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-[1120px] space-y-14 px-5 pb-20 sm:px-8">
          <section aria-labelledby="apa-itu-cv-ats" className="max-w-[820px] space-y-4 text-lg leading-8 text-zinc-700">
            <h2 id="apa-itu-cv-ats" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Apa yang dimaksud CV ATS?</h2>
            <p>
              ATS adalah singkatan dari Applicant Tracking System, yaitu perangkat lunak untuk membantu mengelola lamaran. Dalam konteks membuat CV, istilah ATS biasanya merujuk pada susunan dokumen yang sederhana: informasi berbentuk teks, urutan bagian jelas, serta pengalaman dan keahlian yang mudah ditemukan.
            </p>
            <p>
              Memakai template ATS tidak menjamin lolos seleksi. Sistem, pengaturan perusahaan, persyaratan posisi, dan penilaian perekrut dapat berbeda. Pilih format yang jelas, tetapi tetap utamakan kecocokan serta bukti kemampuan. Jika perusahaan meminta jenis berkas tertentu, ikuti instruksi tersebut.
            </p>
            <p>
              Gunakan bahasa yang diminta pada lowongan dan tulis istilah teknis sesuai pemakaian aslinya. Pengalaman mengolah laporan menggunakan Microsoft Excel lebih informatif daripada sekadar menulis “menguasai komputer”. Jika riwayatmu panjang, pilih bagian yang paling berkaitan dengan posisi tujuan. Tidak semua pengalaman harus mendapat ruang yang sama. CV boleh berlanjut ke halaman berikutnya ketika memang ada informasi relevan; periksa agar judul bagian tidak tertinggal sendirian di ujung halaman.
            </p>
          </section>

          <section aria-labelledby="langkah-cv-ats">
            <h2 id="langkah-cv-ats" className="text-2xl font-bold tracking-tight sm:text-3xl">Cara bikin CV ATS di Lamaranku</h2>
            <ol className="mt-7 grid gap-5 md:grid-cols-2">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
                  <span className="text-sm font-bold text-[#3b63fb]">Langkah {index + 1}</span>
                  <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-zinc-700">{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="contoh-pengalaman" className="max-w-[820px] space-y-4 text-lg leading-8 text-zinc-700">
            <h2 id="contoh-pengalaman" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Tulis pengalaman dengan pekerjaan yang konkret</h2>
            <p>
              Kalimat “bertanggung jawab atas administrasi” belum menjelaskan pekerjaanmu. Jika sesuai kenyataan, kamu bisa menulis “Mengelola arsip surat masuk dan menyusun rekap pengeluaran bulanan menggunakan Excel.” Tambahkan jumlah berkas atau hasil pekerjaan hanya jika datanya memang ada dan bisa kamu pertanggungjawabkan.
            </p>
            <p>
              Belum punya pengalaman kerja formal? Ceritakan magang, proyek kuliah, kegiatan organisasi, atau pekerjaan sukarela yang relevan. Jelaskan tugasmu, alat yang digunakan, dan hasil yang dapat ditunjukkan. Kamu juga dapat <Link href="/portfolio" className="font-semibold text-[#3b63fb] underline underline-offset-4">menyusun portofolio karya</Link> untuk memberi konteks tambahan pada pengalaman tersebut.
            </p>
          </section>

          <section aria-labelledby="checklist-cv-ats" className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
            <h2 id="checklist-cv-ats" className="text-2xl font-bold tracking-tight sm:text-3xl">Checklist sebelum mengirim CV</h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-zinc-700">
              {checklist.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-6 leading-7 text-zinc-700">
              Ingin mendapat masukan lebih lanjut? <Link href="/skor" className="font-semibold text-[#3b63fb] underline underline-offset-4">Review CV dengan AI</Link> setelah masuk ke akun. Tambahkan deskripsi lowongan agar evaluasi dapat membahas kecocokan posisi. Skor dan sarannya merupakan bantuan pemeriksaan, bukan keputusan perekrutan atau jaminan lolos ATS.
            </p>
          </section>

          <section aria-labelledby="batas-gratis" className="max-w-[820px] space-y-4 text-lg leading-8 text-zinc-700">
            <h2 id="batas-gratis" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Apa saja yang bisa dipakai gratis?</h2>
            <p>
              Paket Basic menyediakan dua CV tersimpan di browser dan template gratis, termasuk Harvard, Adelaide, dan Structura. Hasil unduhan Basic memakai cap contoh Lamaranku. Paket Plus menyediakan template tambahan dan hasil tanpa cap. Periksa <Link href="/harga" className="font-semibold text-[#3b63fb] underline underline-offset-4">rincian paket</Link> sebelum memilih.
            </p>
            <p>
              Masuk ke akun untuk membuka editor. Simpanan CV saat ini berada di browser yang kamu gunakan, sehingga berpindah perangkat atau menghapus data browser dapat membuat simpanan tidak tersedia. Unduh PDF sebagai salinan sebelum menghapus data atau mengganti perangkat.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
