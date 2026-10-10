import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { SkorChecker } from "../../components/SkorChecker";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata: Metadata = {
  title: "Cek Skor CV",
  description:
    "Cek mandiri kesiapan CV terhadap sistem ATS dalam 2 menit. Gratis, tanpa daftar.",
};


export default function SkorPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Cek Skor CV"
              title="Seberapa siap CV-mu dibaca sistem?"
              description="Centang yang sudah dipenuhi. Skor dihitung langsung di HP-mu, tanpa daftar dan tanpa data dikirim ke mana pun."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-4 lg:px-6">
            <SkorChecker />
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title="Skor rendah? Perbaiki di builder."
          description="Pakai template ATS, isi pengalaman dengan angka, lalu cek lagi. Gratis 2 CV."
          primary={{ label: "Buka CV Builder", href: "/cv-builder" }}
          secondary={{ label: "Lihat harga Plus", href: "/#harga" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
