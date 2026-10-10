"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, FolderKanban, Gauge, Mail, Sparkles, type LucideIcon } from "lucide-react";
import Navbar from "../components/jds/SiteNavbar";
import ParallaxHero from "../components/jds/ParallaxHero";
import HeroCarousel from "../components/jds/HeroCarousel";
import { SectionHeading } from "../components/jds/SectionHeading";
import { FaqSection } from "../components/jds/FaqSection";
import { SiteFooter } from "../components/jds/SiteFooter";
import { usePlan } from "../components/Builders";
import ComparisonTable from "../components/ComparisonTable";
import CvSheet from "../components/cv/CvSheet";
import { DEFAULT_CV } from "../lib/cv";
import { PLUS_PRICE, WA_NUMBER } from "../data/features";

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

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

const FEATURES: { href: string; icon: LucideIcon; chip: string; title: string; desc: string; cta: string }[] = [
  {
    href: "/cv-builder",
    icon: FileText,
    chip: "10 template",
    title: "CV Builder",
    desc: "Template ATS dan Kreatif. Basic gratis 2 CV tersimpan.",
    cta: "Buka CV Builder"
  },
  {
    href: "/skor",
    icon: Gauge,
    chip: "2 menit",
    title: "Cek Skor CV",
    desc: "Nilai kesiapan ATS lewat cek mandiri 10 kriteria.",
    cta: "Cek skorku"
  },
  {
    href: "/portfolio",
    icon: FolderKanban,
    chip: "1 halaman",
    title: "Portfolio Builder",
    desc: "Kumpulkan karya, simpan lokal, unduh PDF.",
    cta: "Susun portfolio"
  },
  {
    href: "/surat",
    icon: Mail,
    chip: "3x sebulan",
    title: "Generator Surat",
    desc: "Surat lamaran siap kirim dalam 1 menit.",
    cta: "Buat surat"
  },
  {
    href: "/ai-plus",
    icon: Sparkles,
    chip: "Plus",
    title: "AI Plus",
    desc: "Perbaiki kalimat dan saran frasa. Segera hadir.",
    cta: "Pelajari AI Plus"
  }
];

export default function Home() {
  const { isPlus, upgradeDemo, downgradeDemo, ready } = usePlan();

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <ParallaxHero>
        <HeroCarousel />
      </ParallaxHero>

      <section id="fitur" className="relative z-10 scroll-mt-28 bg-white py-12 text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Fitur"
            title="Semua kebutuhan berkas."
            subtitle="Lima alat, satu tempat. Klik kartu untuk membuka halamannya."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="bg-zinc-100 rounded-2xl p-6 group transition-all duration-[600ms] hover:bg-black hover:shadow-lg block"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <f.icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {f.chip}
                </span>
                <span className="mt-4 block text-lg font-bold text-zinc-900 group-hover:text-white">{f.title}</span>
                <span className="mt-1 block text-sm text-zinc-600 group-hover:text-white/60">{f.desc}</span>
                <span className="mt-3 inline-flex items-center gap-0.5 text-sm font-bold text-zinc-900 group-hover:text-white">
                  {f.cta}
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
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

      <section id="preview" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
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

      <section id="ai-plus" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="AI Plus"
            title="Asisten AI untuk berkas."
            subtitle="Segera hadir untuk paket Plus. Merapikan kalimat, mengusulkan frasa, menilai kecocokan lowongan."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: FileText, t: "Perbaiki kalimat CV", d: "AI merapikan dan memperkuat kalimat pengalaman agar terbaca profesional. Kamu yang memutuskan, AI hanya mengusulkan." },
              { icon: Sparkles, t: "Saran frasa siap pakai", d: "Minta bullet point sesuai posisi yang dituju. Salin yang cocok, buang yang tidak." },
              { icon: Gauge, t: "Cek kecocokan lowongan", d: "Tempel syarat lowongan, lihat bagian berkas yang kurang. Tanpa janji lolos." }
            ].map((item) => (
              <Link
                key={item.t}
                href="/ai-plus"
                className="bg-zinc-100 rounded-2xl p-6 sm:p-8 group transition-all duration-[600ms] hover:bg-black hover:shadow-lg block"
              >
                <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-lg font-bold text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <item.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="mt-4 block text-lg font-bold text-zinc-900 group-hover:text-white">{item.t}</span>
                <span className="mt-1 block text-sm text-zinc-600 group-hover:text-white/60">{item.d}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/ai-plus" className="group inline-flex min-h-[44px] items-center gap-0.5 text-sm font-bold text-zinc-900">
              Pelajari AI Plus
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section id="harga" className="relative z-10 scroll-mt-28 py-12 bg-white text-zinc-900 lg:py-16">
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <SectionHeading
            badgeText="Paket"
            title="Batas Basic dan isi Plus."
            subtitle="CV, skor, portfolio, dan surat dalam satu tabel."
            titleClassName="text-[28px] sm:text-[42px]"
            className="mb-12"
          />
          <ComparisonTable />
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-zinc-900 p-6 text-center text-white sm:p-8">
            <p className="text-lg font-bold">Plus {PLUS_PRICE}</p>
            <p className="mt-1 text-xs text-white/60">Harga awal, bisa berubah. Konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis.</p>
            <a
              href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#1473E6] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Upgrade ke Plus
            </a>
          </div>
        </div>
      </section>

      <div id="faq" className="scroll-mt-28">
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
