import type { Metadata } from "next";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { MasukForm } from "../../components/MasukForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Lamaranku.",
};

export default function MasukPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />

      <main>
        <section className="relative overflow-hidden bg-white py-14 sm:py-20">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <PageIntro
              align="center"
              label="Akun"
              title="Masuk ke Lamaranku."
              description="Satu akun untuk semua berkasmu di semua perangkat."
            />
          </div>
        </section>

        <section className="relative bg-white pb-16 lg:pb-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <MasukForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
