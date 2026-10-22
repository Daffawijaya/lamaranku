import type { Metadata } from "next";
import { Gift, ShieldCheck } from "lucide-react";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata: Metadata = {
  title: "Generator Surat Lamaran",
  description:
    "Buat surat lamaran siap kirim dalam 1 menit. Gratis 3 surat per bulan, Plus tanpa batas dan tanpa cap.",
};

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3b63fb] px-7 py-3 text-base font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#274dea]";

export default function SuratPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#2c2c2c] antialiased">
      <Navbar />

      <main>
        <section className="bg-white">
          <div className="mx-auto flex min-h-[620px] w-full max-w-[1056px] flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[650px] sm:px-8 sm:py-20">
            <PageIntro
              label="Generator Surat"
              title="Surat lamaran siap kirim dalam 1 menit."
              description="Tulis nama perusahaan dan posisi, surat tersusun sendiri. Kuota Basic 3 surat per bulan, dibuka lagi tiap tanggal 1."
              align="center"
              titleClassName="max-w-[820px]"
              descriptionClassName="max-w-[660px]"
            />
            <a href="/dashboard/surat" className={`${primaryButton} mt-7 w-full sm:w-auto`}>
              Buat surat
            </a>

            <ul className="mt-7 w-full max-w-[610px] space-y-4 text-left text-base sm:text-lg">
              <li className="flex items-start gap-4">
                <Gift aria-hidden="true" strokeWidth={1.8} className="mt-0.5 h-7 w-7 shrink-0" />
                <span>
                  <strong>3 surat gratis tiap bulan</strong>, kuota dibuka lagi tiap tanggal 1.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <ShieldCheck aria-hidden="true" strokeWidth={1.8} className="mt-0.5 h-7 w-7 shrink-0" />
                <span>
                  <strong>Dalam satu dashboard</strong>, masuk untuk mulai menyiapkan surat lamaranmu.
                </span>
              </li>
            </ul>

            <p className="mt-6 text-base">
              Butuh surat tanpa batas?{" "}
              <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`)} className="font-bold underline underline-offset-2 hover:text-[#1473e6]">
                Upgrade ke Plus
              </a>
              .
            </p>
          </div>
        </section>

        <section id="generator" className="scroll-mt-24 bg-white pb-24 sm:pb-32">
          <div className="mx-auto w-full max-w-[1056px] px-5 sm:px-8">
            <h2 className="mb-12 max-w-[760px] text-left text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:mx-auto sm:text-center sm:text-[36px]">
              Isi tujuan, surat langsung jadi.
            </h2>
            <a href="/dashboard/surat" className={primaryButton}>Buka generator surat</a>
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title={`Butuh surat tanpa batas?`}
          description={`Paket Plus ${PLUS_PRICE} membuka surat unlimited dan unduhan tanpa cap. Harga awal, konfirmasi WA sebelum bayar.`}
          primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
          secondary={{ label: "Lihat perbandingan", href: "/harga" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
