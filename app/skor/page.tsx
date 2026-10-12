import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { SkorHero } from "../../components/skor/SkorHero";
import { PLUS_PRICE } from "../../data/features";

export const metadata: Metadata = {
  title: "Cek Skor CV",
  description:
    "Upload PDF CV, AI menilai kesiapan ATS dalam hitungan detik: skor 0-100 plus poin apa saja yang sudah terisi.",
};

export default function SkorPage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <Navbar />

      <main>
        <SkorHero />

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
