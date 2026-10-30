import { T, LocalizedAttributes } from "../../components/i18n/LanguageProvider";
import { pageMetadata } from "../../lib/seo";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import ComparisonTable from "../../components/ComparisonTable";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata = pageMetadata("/harga", "Harga CV Builder: Paket Basic Gratis & Plus", "Bandingkan paket Basic gratis dan Plus Lamaranku: jumlah CV tersimpan, template, watermark, portofolio, dan surat lamaran. Lihat batas dan harga sebelum memilih.");


export default function HargaPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <LocalizedAttributes><PageIntro
              align="center"
              label="Paket"
              title="Batas Basic dan isi Plus."
              description="Gratis untuk mulai. Naik ke Plus kalau butuh hasil tanpa cap, bantuan AI, atau jumlah tanpa batas."
            /></LocalizedAttributes>
          </div>
        </section>

        <section className="relative overflow-x-clip bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <ComparisonTable />
          </div>
        </section>

        <LocalizedAttributes><TrustCta
          eyebrow="Plus"
          title={`Siap tanpa batas dengan ${PLUS_PRICE}?`}
          description="CV dan surat unlimited, unduhan tanpa cap, semua template terbuka. Harga awal, konfirmasi WA sebelum bayar. Tanpa perpanjangan otomatis."
          primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
          secondary={{ label: "Buat CV gratis", href: "/cv-builder" }}
        /></LocalizedAttributes>
      </main>

      <SiteFooter />
    </div>
  );
}
