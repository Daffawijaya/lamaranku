import Link from "next/link";
import type { Metadata } from "next";
import { T } from "../components/i18n/LanguageProvider";
import Navbar from "../components/jds/SiteNavbar";
import { SiteFooter } from "../components/jds/SiteFooter";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="mx-auto max-w-[720px] px-5 py-24 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"><T text={"Halaman ini tidak ditemukan."} /></h1>
        <p className="mt-4 leading-7 text-zinc-600"><T text={"Alamat yang kamu buka tidak ada atau sudah dipindahkan. Kembali ke beranda atau gunakan salah satu menu di bawah."} /></p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3b63fb] px-7 py-3 text-white hover:bg-[#274dea]"><T text={"Kembali ke beranda"} /></Link>
          <Link href="/cv-builder" className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300 px-7 py-3 hover:bg-zinc-100"><T text={"Buat CV gratis"} /></Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
