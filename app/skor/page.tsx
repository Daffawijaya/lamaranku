import { pageMetadata, featureSchema } from "../../lib/seo";
import { StructuredData } from "../../components/seo/StructuredData";
import Navbar from "../../components/jds/SiteNavbar";
import { TrustCta } from "../../components/jds/TrustCta";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { SkorHero } from "../../components/skor/SkorHero";
import { PLUS_PRICE } from "../../data/features";

const description = "Cek skor CV dan review CV dengan AI. Tinjau bukti pengalaman, kecocokan lowongan, dan prioritas perbaikan berdasarkan isi PDF setelah login.";
export const metadata = pageMetadata("/skor", "Cek Skor CV & Review CV dengan AI", description);

export default function SkorPage() {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <StructuredData data={featureSchema("/skor", "Review CV dengan AI Lamaranku", description)} />
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
