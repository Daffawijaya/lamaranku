import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, Gauge, Sparkles } from "lucide-react";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata: Metadata = {
  title: "AI Plus",
  description:
    "Asisten AI Lamaranku: perbaiki kalimat CV, saran frasa siap pakai, cek kecocokan lowongan. Segera hadir untuk paket Plus.",
};


const ITEMS = [
  {
    icon: FileText,
    t: "Perbaiki kalimat CV",
    d: "AI merapikan dan memperkuat kalimat pengalaman agar terbaca profesional. Kamu yang memutuskan, AI hanya mengusulkan."
  },
  {
    icon: Sparkles,
    t: "Saran frasa siap pakai",
    d: "Minta bullet point sesuai posisi yang dituju. Salin yang cocok, buang yang tidak."
  },
  {
    icon: Gauge,
    t: "Cek kecocokan lowongan",
    d: "Tempel syarat lowongan, lihat bagian berkas yang kurang. Tanpa janji lolos."
  }
];

export default function AiPlusPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="AI Plus"
              title="Asisten AI untuk berkas."
              description="Segera hadir untuk paket Plus. Merapikan kalimat, mengusulkan frasa, menilai kecocokan lowongan."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {ITEMS.map((item) => (
                <div
                  key={item.t}
                  className="bg-zinc-100 rounded-2xl p-6 sm:p-8"
                >
                  <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-lg font-bold text-white">
                    <item.icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="mt-4 block text-lg font-bold text-zinc-900">{item.t}</span>
                  <span className="mt-1 block text-sm text-zinc-600">{item.d}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-zinc-100 p-6 sm:p-8">
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

            <div className="mt-6 text-center">
              <Link href="/harga" className="group inline-flex min-h-[44px] items-center gap-0.5 text-sm font-bold text-zinc-900">
                Lihat harga Plus
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title={`Dapatkan AI Plus dengan ${PLUS_PRICE}?`}
          description="Perapian kalimat, saran frasa, dan cek kecocokan otomatis. Segera hadir. Harga awal, konfirmasi WA sebelum bayar."
          primary={{ label: "Tanya info Plus", href: wa("Halo Lamaranku, saya mau info AI Plus"), external: true }}
          secondary={{ label: "Buat CV gratis", href: "/cv-builder" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
