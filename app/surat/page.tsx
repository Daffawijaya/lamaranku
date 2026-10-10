import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { SuratDemoLive } from "../../components/Builders";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

export const metadata: Metadata = {
  title: "Generator Surat Lamaran",
  description:
    "Buat surat lamaran siap kirim dalam 1 menit. Gratis 3 surat per bulan, Plus tanpa batas dan tanpa cap.",
};


export default function SuratPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Generator Surat"
              title="Surat lamaran siap kirim dalam 1 menit."
              description="Tulis nama perusahaan dan posisi, surat tersusun sendiri. Kuota Basic 3 surat per bulan, dibuka lagi tiap tanggal 1."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <SuratDemoLive />
          </div>
        </section>

        <TrustCta
          eyebrow="Plus"
          title={`Butuh surat tanpa batas?`}
          description={`Paket Plus ${PLUS_PRICE} membuka surat unlimited dan unduhan tanpa cap. Harga awal, konfirmasi WA sebelum bayar.`}
          primary={{ label: "Upgrade ke Plus", href: wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`), external: true }}
          secondary={{ label: "Lihat perbandingan", href: "/#harga" }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
