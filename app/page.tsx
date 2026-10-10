"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "../components/jds/SiteNavbar";
import ParallaxHero from "../components/jds/ParallaxHero";
import HeroCarousel from "../components/jds/HeroCarousel";
import { SectionHeading } from "../components/jds/SectionHeading";
import { FaqSection } from "../components/jds/FaqSection";
import { TrustCta } from "../components/jds/TrustCta";
import { SiteFooter } from "../components/jds/SiteFooter";
import { SuratDemo, usePlan } from "../components/Builders";
import ComparisonTable from "../components/ComparisonTable";
import CvSheet from "../components/cv/CvSheet";
import { DEFAULT_CV } from "../lib/cv";
import { TEMPLATES, type TemplateKind } from "../data/templates";
import { PLUS_PRICE, WA_NUMBER } from "../data/features";

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

type Filter = "semua" | TemplateKind;

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

function TemplateCard({ id }: { id: string }) {
  const t = TEMPLATES.find((x) => x.id === id)!;
  return (
    <Link
      href={`/cv-builder?template=${t.id}`}
      className="bg-zinc-100 rounded-2xl overflow-hidden group relative flex flex-col w-[280px] sm:w-[330px] shrink-0 transition-all duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black hover:shadow-lg"
    >
      <div className="px-4 py-4 flex items-center gap-2 text-sm font-bold">
        <span
          className={`w-5 h-5 rounded flex items-center justify-center text-white text-[11px] font-black ${t.kind === "ats" ? "bg-sky-700" : "bg-fuchsia-700"}`}
          aria-hidden="true"
        >
          {t.kind === "ats" ? "A" : "K"}
        </span>
        <span className="transition-colors duration-300 group-hover:text-white">
          Template {t.kind === "ats" ? "ATS" : "Kreatif"}
        </span>
      </div>
      <div className="mx-4 overflow-hidden rounded-2xl aspect-[3/4] relative bg-white">
        <div className="pointer-events-none select-none" aria-hidden="true">
          <CvSheet data={{ ...DEFAULT_CV, templateId: t.id }} watermark={false} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />
        {t.plusOnly && (
          <span className="absolute right-2 top-2 rounded bg-black px-2 py-0.5 text-[11px] font-bold text-white">
            Plus
          </span>
        )}
      </div>
      <div className="w-full px-4 pt-4 pb-4 flex flex-col justify-center">
        <h3 className="font-bold text-sm tracking-tight mb-1 text-zinc-900 transition-colors duration-300 group-hover:text-white">
          {t.name}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed transition-colors duration-300 group-hover:text-white/60">
          {t.desc}
        </p>
        <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold text-zinc-900 group-hover:text-white">
          Pakai template
          <ChevronRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { isPlus, upgradeDemo, downgradeDemo, ready } = usePlan();
  const [filter, setFilter] = useState<Filter>("semua");
  const list = TEMPLATES.filter((t) => filter === "semua" || t.kind === filter);

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <ParallaxHero>
        <HeroCarousel />
      </ParallaxHero>

      <section id="template" className="featured-sec relative z-10 bg-white pt-12 pb-6 text-zinc-900 sm:pt-20 lg:pb-20">
        <div className="row-wrap px-5 sm:px-4 lg:px-6 text-center">
          <SectionHeading
            badgeText="Galeri Template"
            title="Pilih template yang cocok untukmu."
            subtitle="Sepuluh template ATS Friendly dan Kreatif. Klik kartu untuk langsung mengisi datamu. Basic menyimpan 2 CV gratis."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="flex items-center justify-center gap-2 mb-8" role="group" aria-label="Saring jenis template">
            {(["semua", "ats", "kreatif"] as Filter[]).map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-6 text-sm font-semibold transition-colors ${
                  filter === f ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
                }`}
              >
                {f === "semua" ? "Semua" : f === "ats" ? "ATS" : "Kreatif"}
              </button>
            ))}
          </div>
          <div className="marquee relative overflow-hidden">
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
            <div className="marquee-track flex w-max py-4 text-left">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1}>
                  {list.map((t) => (
                    <TemplateCard key={`${copy}-${t.id}`} id={t.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 pt-6 bg-white text-zinc-900 lg:pt-12">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Panduan Memilih"
            title="ATS lawan Kreatif, mana yang cocok?"
            subtitle="Pilih jenis CV sesuai industri dan posisi yang kamu lamar."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                t: "CV ATS-Friendly",
                s: "Lolos sistem otomatis",
                d: "Dirancang agar terbaca sistem penyaring sebelum sampai ke meja HRD.",
                items: [
                  "Format standar yang mudah dipindai sistem",
                  "Judul bagian jelas: pengalaman, pendidikan, keahlian",
                  "Cocok untuk BUMN, korporat, bank, instansi",
                  "Tanpa tabel dan grafik yang mengacaukan bacaan"
                ],
                href: "/cv-builder?kind=ats",
                cta: "Pilih CV ATS-Friendly"
              },
              {
                t: "CV Kreatif",
                s: "Tampil beda di mata HRD",
                d: "Desain visual yang menarik perhatian di industri kreatif dan startup.",
                items: [
                  "Bilah sisi, warna, dan aksen visual",
                  "Ruang khusus keahlian dan portofolio",
                  "Cocok untuk agensi, startup, media, desain",
                  "Terlihat beda dari ratusan pelamar"
                ],
                href: "/cv-builder?kind=kreatif",
                cta: "Pilih CV Kreatif"
              }
            ].map((c) => (
              <div key={c.t} className="bg-zinc-100 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-zinc-900">{c.t}</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-600">{c.s}</p>
                <p className="mt-2 text-sm text-zinc-600">{c.d}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-900">
                  {c.items.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span aria-hidden="true" className="font-bold">✓</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <Link href={c.href} className="group mt-6 inline-flex min-h-[44px] items-center gap-0.5 text-sm font-bold text-zinc-900">
                  {c.cta}
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Cara Kerja"
            title="Dari template ke lamaran."
            subtitle="Tiga langkah cepat, batasnya tertulis jelas."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ["1", "Pilih Template", "Saring ATS atau Kreatif, klik pakai. Template Plus bertanda jelas."],
              ["2", "Isi Informasi", "Data diri, pengalaman, pendidikan, keahlian. Hasil mengikuti template langsung."],
              ["3", "Simpan dan Unduh", "Basic menyimpan 2 CV. Unduh lewat dialog cetak, Plus tanpa cap."]
            ].map(([n, t, d]) => (
              <Link
                key={n}
                href="/cv-builder"
                className="bg-zinc-100 rounded-2xl p-6 sm:p-8 group transition-all duration-[600ms] hover:bg-black hover:shadow-lg block"
              >
                <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-lg font-bold text-white group-hover:bg-white group-hover:text-black transition-colors">{n}</span>
                <span className="mt-4 block text-lg font-bold text-zinc-900 group-hover:text-white">{t}</span>
                <span className="mt-1 block text-sm text-zinc-600 group-hover:text-white/60">{d}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Pratinjau Nyata"
            title="Lihat hasil sebelum menyimpan."
            subtitle="Contoh nyata dari builder, template Harvard. Ganti datanya dengan datamu di halaman builder."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="max-h-[440px] overflow-hidden">
              <CvSheet data={DEFAULT_CV} watermark={false} />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
              <span className="text-sm text-zinc-600">
                Mode: {ready ? (isPlus ? "Plus" : "Basic") : "memuat"}
                {isPlus ? (
                  <button onClick={downgradeDemo} className="ml-2 underline">Lihat sebagai Basic</button>
                ) : (
                  <button onClick={upgradeDemo} className="ml-2 underline">Lihat sebagai Plus</button>
                )}
              </span>
              <Link
                href="/cv-builder"
                className="inline-flex min-h-[44px] items-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Isi dengan datamu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="AI Career Assistant"
            title="Bantuan kalimat, khusus Plus."
            subtitle="Fitur ini segera hadir. Rancangannya: AI merapikan kalimat, menilai kecocokan, mengusulkan frasa."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="bg-zinc-100 rounded-2xl p-6 sm:p-8">
              <ul className="space-y-2 text-sm text-zinc-900">
                {[
                  "Perapian kalimat pengalaman yang lembek",
                  "Skor kecocokan dengan syarat lowongan",
                  "Saran frasa sesuai posisi yang dituju"
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span aria-hidden="true" className="font-bold">✓</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <a href={wa("Halo Lamaranku, saya mau tahu info fitur AI Plus")} className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black">
                Tanya info AI Plus
              </a>
            </div>
            <div className="bg-zinc-100 rounded-2xl p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Contoh ilustrasi, bukan hasil nyata</p>
              <div className="mt-3 rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold text-zinc-500">Sebelum</p>
                <p className="mt-1 text-sm text-zinc-900">Bertanggung jawab atas arsip di kantor.</p>
              </div>
              <div className="mt-3 rounded-2xl bg-zinc-900 p-4">
                <p className="text-xs font-semibold text-white/70">Sesudah dibantu AI</p>
                <p className="mt-1 text-sm text-white">Menata arsip surat masuk dan keluar serta menyusun laporan bulanan tepat waktu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Fitur"
            title="Semua kebutuhan berkas."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Template ATS", "Satu kolom teks polos yang terbaca sistem penyaring."],
              ["Template Kreatif", "Bilah sisi dan warna untuk industri kreatif."],
              ["Unduh PDF", "Lewat dialog cetak, rapi di semua perangkat."],
              ["Data di peramban", "Tanpa daftar untuk mencoba, tersimpan lokal."],
              ["Batas tertulis", "Basic dan Plus tercantum jelas sebelum bayar."],
              ["Harga awal ringan", `Plus ${PLUS_PRICE}, konfirmasi WA sebelum bayar.`]
            ].map(([t, d]) => (
              <div key={t} className="bg-zinc-100 rounded-2xl p-6">
                <p className="text-lg font-bold text-zinc-900">{t}</p>
                <p className="mt-1 text-sm text-zinc-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo-surat" className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Generator Surat"
            title="Coba generator surat di sini."
            subtitle="Kuota Basic 3 surat per bulan, dibuka lagi tiap tanggal 1."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <SuratDemo isPlus={isPlus} />
        </div>
      </section>

      <section id="perbandingan" className="relative z-10 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Paket"
            title="Batas Basic dan isi Plus."
            subtitle="CV, surat, portfolio, dan kelas dalam satu tabel."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <ComparisonTable />
        </div>
      </section>

      <TrustCta
        eyebrow="Plus"
        title={`Siap tanpa batas dengan ${PLUS_PRICE}?`}
        description="CV dan surat unlimited, unduhan tanpa cap, semua template terbuka. Harga awal, konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis."
        primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
        secondary={{ label: "Lihat perbandingan", href: "#perbandingan" }}
      />

      <div id="faq" className="scroll-mt-24">
        <FaqSection
          title="Pertanyaan populer."
          items={FAQS.map(([question, answer]) => ({ question, answer }))}
        />
      </div>

      <SiteFooter />

      <div className="no-print fixed bottom-6 right-6 z-50 hidden flex-col items-end gap-2 transition-opacity duration-500 md:flex">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Chat via WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg ring-2 ring-white/20 transition hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current text-white" aria-hidden="true"><path d={WA_PATH} /></svg>
        </a>
      </div>
      <div className="no-print fixed bottom-[25vh] right-0 z-50 flex items-center gap-2 transition-opacity duration-500 md:hidden">
        <a
          href={wa("Halo Lamaranku, saya butuh bantuan")}
          aria-label="Bantuan, chat via WhatsApp"
          className="flex flex-col items-center gap-1.5 rounded-l-lg bg-[#25D366] px-1.5 py-3 text-white shadow-lg ring-2 ring-white/20 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d={WA_PATH} /></svg>
          <span className="text-[11px] font-bold text-white">Bantuan</span>
        </a>
      </div>
    </div>
  );
}
