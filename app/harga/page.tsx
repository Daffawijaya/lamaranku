import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import ComparisonTable from "../../components/ComparisonTable";
import { PLUS_PRICE, WA_NUMBER } from "../../data/features";

export const metadata: Metadata = {
  title: "Harga Basic dan Plus",
  description:
    "Batas paket Basic dan isi paket Plus Lamaranku: CV, surat, portfolio, dan Career Academy dalam satu tabel.",
};

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

export default function HargaPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Paket"
              title="Batas Basic dan isi Plus."
              description="Gratis untuk mulai. Naik ke Plus kalau butuh hasil tanpa cap, bantuan AI, atau jumlah tanpa batas."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <ComparisonTable />
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title={`Siap tanpa batas dengan ${PLUS_PRICE}?`}
          description="CV dan surat unlimited, unduhan tanpa cap, semua template terbuka. Harga awal, konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis."
          primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
          secondary={{ label: "Buat CV gratis", href: "/cv-builder" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
