"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ComparisonTable from "../components/ComparisonTable";
import { SuratDemo, usePlan } from "../components/Builders";
import { MiniPreview } from "../components/cv/TemplateGallery";
import CvSheet from "../components/cv/CvSheet";
import { DEFAULT_CV } from "../lib/cv";
import { TEMPLATES, type TemplateKind } from "../data/templates";
import { PLUS_PRICE, WA_NUMBER } from "../data/features";
import Footer from "../components/Footer";
import FooterBrand from "../components/FooterBrand";

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

type Filter = "semua" | TemplateKind;

const ATS_COUNT = TEMPLATES.filter((t) => t.kind === "ats").length;
const KREATIF_COUNT = TEMPLATES.filter((t) => t.kind === "kreatif").length;

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const FAQS: [string, string][] = [
  [
    "Gratisnya sampai mana?",
    "Paket Basic menyimpan 2 CV dan membuat 3 surat tiap bulan. Hasil unduhan memakai cap contoh Lamaranku."
  ],
  [
    "Apa beda template ATS dan Kreatif?",
    "ATS satu kolom teks polos agar terbaca sistem penyaring perusahaan besar dan BUMN. Kreatif memakai bilah sisi dan warna, cocok untuk agensi, startup, dan industri media."
  ],
  [
    "Di mana data saya disimpan?",
    "Fase ini data tersimpan di perambanmu sendiri, bukan di server. Ganti HP berarti mulai lagi. Akun server menyusul di fase berikutnya."
  ],
  [
    "Bagaimana cara mengunduh CV?",
    "Tekan Unduh PDF di halaman builder, lalu pilih simpan sebagai PDF di dialog cetak. Paket Basic ikut mencetak cap contoh, Plus bersih."
  ],
  [
    "Template mana yang terkunci?",
    "Oxford, Bold Impact, dan Geo Flow khusus Plus. Tujuh template lain terbuka untuk Basic."
  ],
  [
    "Berapa harga Plus?",
    `Harga awal ${PLUS_PRICE}. Angka ini masih bisa berubah, konfirmasi lewat WA sebelum membayar. Fase ini pembayaran manual lewat QRIS.`
  ]
];

function GalleryCard({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  const t = TEMPLATES.find((x) => x.id === id)!;
  return (
    <div className="w-[220px] flex-shrink-0 sm:w-[250px]">
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-li-card transition-all duration-300 hover:-translate-y-1 hover:border-li-blue/50">
        <div className="relative aspect-[3/4] bg-white">
          <MiniPreview id={t.id} kind={t.kind} h="h-full" />
          {t.plusOnly && (
            <span className="absolute right-2 top-2 rounded bg-li-gold px-2 py-0.5 text-[11px] font-bold text-black">
              Plus
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <span
            className={`inline-block w-fit rounded px-2 py-0.5 text-[11px] font-bold ${
              t.kind === "ats" ? "bg-li-blue text-white" : "bg-li-green text-white"
            }`}
          >
            {t.kind === "ats" ? "ATS OPTIMIZED" : "KREATIF"}
          </span>
          <p className="mt-2 font-bold text-li-text">{t.name}</p>
          <button
            onClick={() => onOpen(t.id)}
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full border border-li-blue px-3 font-semibold text-li-link hover:bg-li-blue/15"
          >
            Pakai {t.name}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isPlus, upgradeDemo, downgradeDemo, ready } = usePlan();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState<Filter>("semua");
  const [faq, setFaq] = useState<number | null>(null);

  const open = (id: string) => router.push(`/cv-builder?template=${id}`);
  const list = TEMPLATES.filter((t) => filter === "semua" || t.kind === filter);

  return (
    <main className="min-h-screen bg-black text-li-text">
      <nav className="sticky top-4 z-40 mx-auto mb-8 mt-4 w-[95%] rounded-full border border-white/10 bg-li-header/90 shadow-lg backdrop-blur-md sm:w-4/5">
        <div className="px-6 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#atas" className="flex items-center py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-li-blue text-xl font-black text-white" aria-hidden="true">in</span>
              <span className="ml-3 text-xl font-bold text-white">Lamaranku</span>
            </a>
            <div className="hidden items-center space-x-2 lg:flex">
              <a className="rounded-full px-4 py-2 font-semibold text-li-text hover:bg-white/10 hover:text-white" href="/cv-builder">CV Builder</a>
              <a className="rounded-full px-4 py-2 font-semibold text-li-text hover:bg-white/10 hover:text-white" href="#template">Template</a>
              <a className="rounded-full px-4 py-2 font-semibold text-li-text hover:bg-white/10 hover:text-white" href="#harga">Harga</a>
            </div>
            <div className="hidden lg:flex">
              <a href="/cv-builder" className="inline-flex min-h-[44px] items-center rounded-full bg-li-blue px-5 py-2 text-sm font-bold text-white hover:bg-li-blueHover">
                Buat CV
              </a>
            </div>
            <div className="lg:hidden">
              <button
                onClick={() => setMenu(!menu)}
                aria-expanded={menu}
                aria-label={menu ? "Tutup menu" : "Buka menu"}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <span aria-hidden="true" className="block h-0.5 w-6 bg-li-text" />
                <span aria-hidden="true" className="mt-1.5 block h-0.5 w-6 bg-li-text" />
                <span aria-hidden="true" className="mt-1.5 block h-0.5 w-6 bg-li-text" />
              </button>
            </div>
          </div>
          {menu && (
            <div className="flex flex-col gap-1 pb-4 lg:hidden">
              {[
                ["CV Builder", "/cv-builder"],
                ["Template", "#template"],
                ["Harga", "#harga"]
              ].map(([t, href]) => (
                <a key={t} href={href} onClick={() => setMenu(false)} className="inline-flex min-h-[44px] items-center rounded-lg px-3 font-semibold hover:bg-white/10">
                  {t}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <section className="overflow-hidden bg-black">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="flex flex-col items-center gap-6 py-8 lg:flex-row lg:items-start lg:gap-0 lg:py-0">
            <div className="flex w-full items-start justify-center lg:order-2 lg:flex-1 lg:justify-end lg:self-start">
              <div className="w-full max-w-[280px] overflow-hidden rounded-lg border border-white/10 bg-li-card sm:max-w-[380px]">
                <div className="max-h-[430px] overflow-hidden bg-white">
                  <CvSheet data={DEFAULT_CV} watermark={false} />
                </div>
                <p className="border-t border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-li-muted">
                  Contoh nyata dari builder, template Harvard
                </p>
              </div>
            </div>
            <div className="flex-1 lg:order-1 lg:py-16 lg:pr-8">
              <h1 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Lolos Penyaring
                <span className="block text-li-link">dengan CV ATS Friendly</span>
              </h1>
              <p className="mb-8 max-w-md text-sm leading-relaxed text-li-muted sm:text-base">
                Pilih template, isi data 10 menit dari HP, unduh PDF siap kirim.
                Gratis untuk 2 CV dan 3 surat tiap bulan.
              </p>
              <div className="mb-10">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <a href="/cv-builder" className="inline-flex items-center gap-2 rounded-full bg-li-blue px-7 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-li-blueHover">
                    Buat CV Sekarang
                  </a>
                  <a href="#template" className="hidden items-center gap-3 text-li-muted transition-colors hover:text-li-link sm:flex">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-li-card ring-1 ring-white/15" aria-hidden="true">
                      <span className="ml-0.5 h-0 w-0 border-y-8 border-l-[12px] border-y-transparent border-l-li-blue" />
                    </span>
                    <span className="text-sm font-semibold">Lihat template</span>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["ATS Friendly", "Satu kolom yang terbaca sistem"],
                  ["Data Aman", "Tersimpan di perambanmu"],
                  ["Batas Jelas", "Basic dan Plus tertulis"],
                  ["Cepat dan Mudah", "10 menit dari HP"]
                ].map(([t, d]) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-li-card ring-1 ring-white/15" aria-hidden="true">
                      <span className="text-sm font-bold text-li-link">✓</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-li-text">{t}</p>
                      <p className="hidden text-xs leading-snug text-li-muted sm:block">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm">
                <span className={`rounded-full px-3 py-1 font-bold ${isPlus ? "bg-li-blue text-white" : "bg-white/10 text-li-muted"}`}>
                  Mode: {ready ? (isPlus ? "Plus" : "Basic") : "memuat"}
                </span>
                {isPlus ? (
                  <button onClick={downgradeDemo} className="text-li-link underline">Lihat sebagai Basic</button>
                ) : (
                  <button onClick={upgradeDemo} className="text-li-link underline">Lihat sebagai Plus</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="template" className="bg-black py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              {TEMPLATES.length} Template <span className="text-li-link">ATS dan Kreatif</span> Tersedia
            </h2>
            <p className="mx-auto max-w-2xl text-base text-li-muted">
              {ATS_COUNT} template ATS untuk perusahaan besar dan BUMN,
              {KREATIF_COUNT} template Kreatif untuk agensi dan startup.
              Klik pakai untuk langsung mengisi.
            </p>
          </div>
          <div className="mb-8 flex items-center justify-center gap-2" role="tablist" aria-label="Saring jenis template">
            {(["semua", "ats", "kreatif"] as Filter[]).map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-[44px] rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  filter === f ? "bg-li-blue text-white" : "bg-white/10 text-li-muted hover:bg-white/15 hover:text-li-text"
                }`}
              >
                {f === "semua" ? "Semua" : f === "ats" ? "ATS-Friendly" : "Kreatif"}
              </button>
            ))}
          </div>
        </div>
        <div className="marquee relative overflow-hidden">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" aria-hidden="true" />
          <div className="marquee-track flex w-max gap-5 py-4">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-5" aria-hidden={copy === 1}>
                {list.map((t) => (
                  <GalleryCard key={`${copy}-${t.id}`} id={t.id} onOpen={open} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">ATS-Friendly lawan Kreatif: Mana yang Cocok?</h2>
            <p className="mx-auto max-w-2xl text-li-muted">Pilih jenis CV sesuai industri dan posisi yang kamu lamar.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-li-card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-li-text">CV ATS-Friendly</h3>
              <p className="mt-1 text-sm font-semibold text-li-link">Lolos sistem otomatis</p>
              <p className="mt-2 text-sm text-li-muted">Dirancang agar terbaca sistem penyaring sebelum sampai ke meja HRD.</p>
              <ul className="mt-4 space-y-2 text-sm text-li-text">
                {[
                  "Format standar yang mudah dipindai sistem",
                  "Judul bagian jelas: pengalaman, pendidikan, keahlian",
                  "Cocok untuk BUMN, korporat, bank, instansi",
                  "Tanpa tabel dan grafik yang mengacaukan bacaan"
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span aria-hidden="true" className="font-bold text-li-link">✓</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <a href="/cv-builder?kind=ats" className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-li-text hover:bg-white/15">
                Pilih CV ATS-Friendly
              </a>
            </div>
            <div className="rounded-lg border border-li-blue/50 bg-li-card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-li-text">CV Kreatif</h3>
              <p className="mt-1 text-sm font-semibold text-li-link">Tampil beda di mata HRD</p>
              <p className="mt-2 text-sm text-li-muted">Desain visual yang menarik perhatian di industri kreatif dan startup.</p>
              <ul className="mt-4 space-y-2 text-sm text-li-text">
                {[
                  "Bilah sisi, warna, dan aksen visual",
                  "Ruang khusus keahlian dan portofolio",
                  "Cocok untuk agensi, startup, media, desain",
                  "Terlihat beda dari ratusan pelamar"
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span aria-hidden="true" className="font-bold text-li-link">✓</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <a href="/cv-builder?kind=kreatif" className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-li-blue px-6 py-3 text-sm font-bold text-white hover:bg-li-blueHover">
                Pilih CV Kreatif
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Buat CV profesional dalam 3 langkah</h2>
            <p className="mt-2 text-li-muted">Dari template ke lamaran, cepat dan jelas batasnya.</p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "Pilih Template", "Saring ATS atau Kreatif, klik pakai. Template Plus bertanda jelas.", "/cv-builder"],
              ["2", "Isi Informasi", "Data diri, pengalaman, pendidikan, keahlian. Hasil mengikuti template langsung.", "/cv-builder"],
              ["3", "Simpan dan Unduh", "Basic menyimpan 2 CV. Unduh lewat dialog cetak, Plus tanpa cap.", "/cv-builder"]
            ].map(([n, t, d, href]) => (
              <li key={n}>
                <a href={href} className="block h-full rounded-lg border border-white/10 bg-li-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-li-blue/50">
                  <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-li-blue/15 text-lg font-bold text-li-link">{n}</span>
                  <span className="mt-4 block text-lg font-bold text-li-text">{t}</span>
                  <span className="mt-1 block text-sm text-li-muted">{d}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-black py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="grid items-center gap-4 lg:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-li-blue/15 px-4 py-1 text-sm font-bold text-li-link">AI Career Assistant</span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Bantuan kalimat, khusus Plus</h2>
              <p className="mt-2 text-li-muted">
                Fitur ini segera hadir. Rancangannya: AI merapikan kalimat pengalaman,
                menilai kecocokan lowongan, dan mengusulkan frasa siap pakai.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-li-text">
                {[
                  "Perapian kalimat pengalaman yang lembek",
                  "Skor kecocokan dengan syarat lowongan",
                  "Saran frasa sesuai posisi yang dituju"
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span aria-hidden="true" className="font-bold text-li-link">✓</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <a href={wa(`Halo Lamaranku, saya mau tahu info fitur AI Plus`)} className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-li-blue px-6 py-3 text-sm font-bold text-white hover:bg-li-blueHover">
                Tanya info AI Plus
              </a>
            </div>
            <div className="rounded-lg border border-white/10 bg-li-card p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-li-muted">Contoh ilustrasi, bukan hasil nyata</p>
              <div className="mt-3 rounded-lg bg-white/5 p-4">
                <p className="text-xs font-semibold text-li-muted">Sebelum</p>
                <p className="mt-1 text-sm text-li-text">Bertanggung jawab atas arsip di kantor.</p>
              </div>
              <div className="mt-3 rounded-lg border border-li-blue/40 bg-li-blue/10 p-4">
                <p className="text-xs font-semibold text-li-link">Sesudah dibantu AI</p>
                <p className="mt-1 text-sm text-li-text">Menata arsip surat masuk dan keluar serta menyusun laporan bulanan tepat waktu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Semua kebutuhan berkas dalam satu tempat</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Template ATS", "Satu kolom teks polos yang terbaca sistem penyaring."],
              ["Template Kreatif", "Bilah sisi dan warna untuk industri kreatif."],
              ["Unduh PDF", "Lewat dialog cetak, rapi di semua perangkat."],
              ["Data di peramban", "Tanpa daftar untuk mencoba, tersimpan lokal."],
              ["Batas tertulis", "Basic dan Plus tercantum jelas sebelum bayar."],
              ["Harga awal ringan", `Plus ${PLUS_PRICE}, konfirmasi WA sebelum bayar.`]
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-white/10 bg-li-card p-6">
                <p className="text-lg font-bold text-li-text">{t}</p>
                <p className="mt-1 text-sm text-li-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo-surat" className="bg-black pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Coba generator surat di sini</h2>
          <p className="mt-2 max-w-2xl text-li-muted">Kuota Basic 3 surat per bulan, dibuka lagi tiap tanggal 1.</p>
          <div className="mt-4">
            <SuratDemo isPlus={isPlus} />
          </div>
        </div>
      </section>

      <section id="perbandingan" className="bg-black py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Batas Basic dan isi Plus</h2>
            <p className="mt-2 text-li-muted">CV, surat, portfolio, dan kelas dalam satu tabel.</p>
          </div>
          <ComparisonTable />
          <div id="harga" className="mx-auto mt-6 max-w-3xl scroll-mt-24 rounded-lg border border-li-gold/30 bg-li-card p-6 text-center">
            <p className="text-sm text-li-muted">Harga awal</p>
            <p className="mt-1 text-3xl font-black text-li-gold">{PLUS_PRICE}</p>
            <p className="mt-1 text-xs text-li-muted">Tanpa perpanjangan otomatis • Unduhan Plus tanpa cap</p>
            <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`)} className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-li-gold px-7 py-3 text-sm font-black text-black hover:brightness-110">
              Upgrade ke Plus
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-black py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-16">
          <div className="mb-12 text-center">
            <span className="mb-6 inline-block rounded-full bg-li-card px-4 py-2 text-sm font-bold text-li-link ring-1 ring-white/15">FAQ</span>
            <h2 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Semua yang perlu kamu tahu
              <span className="mx-auto inline w-fit border-b-4 border-li-gold text-li-link"> sebelum submit</span>
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {FAQS.map(([q, a], i) => (
              <article key={q} className="self-start overflow-hidden rounded-lg border border-white/10 bg-li-card">
                <button
                  type="button"
                  aria-expanded={faq === i}
                  onClick={() => setFaq(faq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors hover:bg-white/5"
                >
                  <span className="pr-4 text-lg font-semibold leading-snug text-li-text">{q}</span>
                  <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-li-blue/15 text-lg font-bold text-li-link transition-transform ${faq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {faq === i && (
                  <div className="border-t border-white/10 px-6 pb-6 text-sm leading-relaxed text-li-muted">
                    <div className="pt-4">{a}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-li-blue py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center sm:px-8 lg:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Siap buat CV profesionalmu?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            10 template menunggu. Gratis untuk 2 CV pertama, Plus {PLUS_PRICE} untuk tanpa batas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/cv-builder" className="inline-flex min-h-[44px] items-center rounded-full bg-white px-7 py-3 text-base font-bold text-li-blue">
              Mulai buat CV
            </a>
            <a href="#template" className="inline-flex min-h-[44px] items-center rounded-full border border-white/60 px-7 py-3 text-base font-semibold text-white">
              Lihat template
            </a>
          </div>
          <p className="mt-4 text-sm text-white/70">Tanpa perpanjangan otomatis • Unduhan Plus tanpa cap</p>
        </div>
      </section>

      <Footer />
      <FooterBrand />

      <div className="no-print fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-2 transition-opacity duration-500 md:flex">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Chat via WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-2 ring-white/20 transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-white" aria-hidden="true"><path d={WA_PATH} /></svg>
        </a>
      </div>
      <div className="no-print fixed bottom-[25vh] right-0 z-50 flex items-center gap-2 transition-opacity duration-500 md:hidden">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Bantuan, chat via WhatsApp"
          className="flex flex-col items-center gap-1.5 rounded-l-lg bg-[#25D366] px-1.5 py-3 text-white shadow-lg ring-2 ring-white/20 transition-all duration-200 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d={WA_PATH} /></svg>
          <span className="text-[11px] font-bold text-white">Bantuan</span>
        </a>
      </div>
    </main>
  );
}
