import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { SkorChecker, ScoreCard } from "../../components/SkorChecker";
import { PLUS_PRICE } from "../../data/features";

export const metadata: Metadata = {
  title: "Cek Skor CV",
  description:
    "Upload PDF CV, AI menilai kesiapan ATS dalam hitungan detik: skor 0-100 plus poin apa saja yang sudah terisi.",
};

const BTN_BLUE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3b63fb] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#274dea]";
const BTN_OUTLINE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";

export default function SkorPage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <Navbar />

      <main>
        <section className="scroll-mt-28 bg-[#f5f5f5]">
          <div className="grid w-full lg:grid-cols-2">
            <div className="flex min-h-[560px] flex-col justify-center px-5 py-8 sm:px-4 lg:min-h-[calc(100svh-4rem)] lg:py-14 lg:pl-[max(1.5rem,calc((100vw-1310px)/2+1.5rem))] lg:pr-16">
              <PageIntro
                label="Cek Skor CV"
                title="Seberapa siap CV-mu dibaca sistem?"
                description="Upload PDF, AI menilai kesiapan ATS dalam hitungan detik. Gratis, tanpa daftar."
                titleClassName="max-w-[480px]"
                descriptionClassName="max-w-[500px]"
              />
              <p className="mt-6 text-lg font-bold">Mulai dari PDF yang kamu punya.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#alat" className={BTN_BLUE}>
                  Upload CV
                </a>
                <Link href="/cv-builder" className={BTN_OUTLINE}>
                  Buka CV Builder
                </Link>
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden bg-white lg:min-h-[calc(100svh-4rem)]" aria-hidden="true">
              <div className="absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden p-8 sm:p-12">
                <ScoreCard score={85} verdict="Contoh: siap kirim, tinggal poles keyword lowongan." />
                <ul className="space-y-3">
                  {["Kontak lengkap", "Satu kolom", "Angka hasil"].map((t) => (
                    <li key={t} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white bg-zinc-900 text-white">
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      <span className="font-bold">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="alat" className="relative scroll-mt-24 bg-white pb-16 pt-14 lg:pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-4 lg:px-6">
            <SkorChecker />
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title="Skor rendah? Perbaiki dengan AI Plus."
          description={`AI Plus merapikan kalimat dan memberi saran perbaikan instan. Segera hadir di paket ${PLUS_PRICE}.`}
          primary={{ label: "Lihat harga Plus", href: "/#harga" }}
          secondary={{ label: "Buka CV Builder", href: "/cv-builder" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
