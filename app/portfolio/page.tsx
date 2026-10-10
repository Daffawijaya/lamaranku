import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { PortfolioBuilder } from "../../components/PortfolioBuilder";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata: Metadata = {
  title: "Portfolio Builder",
  description:
    "Susun portfolio karya dalam 5 menit. Simpan di peramban, unduh PDF. Link online menyusul di Plus.",
};


export default function PortfolioPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Portfolio Builder"
              title="Kumpulkan karyamu di satu halaman."
              description="Isi profil dan karya, lihat hasilnya langsung. Tersimpan di perambanmu, bisa diunduh PDF."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PortfolioBuilder />
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
