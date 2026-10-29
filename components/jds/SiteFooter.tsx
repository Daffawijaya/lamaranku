import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { navigation } from "../../data/navigation";
import { WA_NUMBER } from "../../data/features";
import FooterAccordion from "./FooterAccordion";

const FITUR = [
  { name: "CV Builder", href: "/cv-builder" },
  { name: "Panduan CV ATS", href: "/cv-ats" },
  { name: "Cek Skor CV", href: "/skor" },
  { name: "Portfolio Builder", href: "/portfolio" },
  { name: "Generator Surat", href: "/surat" },
  { name: "AI Plus", href: "/#ai-plus" },
  { name: "Template", href: "/#preview" },
  { name: "Harga", href: "/harga" },
  { name: "FAQ", href: "/#faq" },
];

export function SiteFooter({ variant = "light" }: { variant?: "dark" | "light" }) {
  const dark = variant === "dark";

  return (
    <footer
      className={`relative z-0 isolate text-sm overflow-hidden ${
        dark ? "bg-black text-zinc-400" : "bg-[#f8f8f8] text-gray-600"
      }`}
    >
      <div className={`relative z-10 pt-8 sm:pt-10 ${dark ? "bg-black" : "bg-[#f8f8f8]"}`}>
        <div className="max-w-[1310px] mx-auto px-5 sm:px-4 lg:px-6">
          <div className="hidden grid-cols-1 gap-8 mb-12 sm:grid sm:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-1 sm:col-span-2 space-y-3">
              <LocalizedAttributes><Link href="/" aria-label="Lamaranku beranda" className="inline-flex items-center">
                <span className={`text-3xl font-black tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>
                  <T text={"lamaranku. "} /></span>
              </Link></LocalizedAttributes>
              <p className="leading-relaxed"><T text={"Berkas lamaran rapi dari HP. CV ATS dan surat lamaran dalam satu tempat."} /></p>
              <p className={dark ? "text-zinc-500" : "text-gray-500"}><T text={"Gratis untuk mulai, Plus untuk tanpa batas."} /></p>
            </div>

            <div>
              <h4 className={`font-semibold text-base mb-3 ${dark ? "text-white" : "text-gray-900"}`}><T text={"Navigasi"} /></h4>
              <ul className="space-y-2">
                {navigation.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`transition-colors ${dark ? "hover:text-white" : "hover:text-black"}`}>
                      <T text={link.label} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold text-base mb-3 ${dark ? "text-white" : "text-gray-900"}`}><T text={"Fitur Lamaranku"} /></h4>
              <ul className="space-y-2">
                {FITUR.map((f) => (
                  <li key={f.href + f.name}>
                    <Link href={f.href} className={`transition-colors ${dark ? "hover:text-white" : "hover:text-black"}`}>
                      <T text={f.name} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold text-base mb-3 ${dark ? "text-white" : "text-gray-900"}`}><T text={"Hubungi Kami"} /></h4>
              <ul className="space-y-2">
                <li className="leading-relaxed"><T text={"Malang, Jawa Timur"} /></li>
                <li>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=Halo%20Lamaranku`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-colors ${dark ? "hover:text-white" : "hover:text-black"}`}
                  >
                    <T text={"Chat WhatsApp "} /></a>
                </li>
                <li>
                  <a
                    href="https://daffayanwijaya.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-colors ${dark ? "hover:text-white" : "hover:text-black"}`}
                  >
                    <T text={"Daffa Yan Wijaya "} /></a>
                </li>
              </ul>
            </div>
          </div>

          <div className="sm:hidden">
            <div className="pb-7">
              <LocalizedAttributes><Link href="/" aria-label="Lamaranku beranda" className="inline-flex items-center">
                <span className={`text-3xl font-black tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>
                  <T text={"lamaranku. "} /></span>
              </Link></LocalizedAttributes>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed"><T text={"Gratis untuk mulai, Plus untuk tanpa batas."} /></p>
            </div>

            <div className={`border-t ${dark ? "border-white/10" : "border-black/10"}`}>
              <LocalizedAttributes><FooterAccordion title="Navigasi" dark={dark}>
                <ul className="grid gap-3">
                  {navigation.map((link) => (
                    <li key={link.href}><Link href={link.href}><T text={link.label} /></Link></li>
                  ))}
                </ul>
              </FooterAccordion></LocalizedAttributes>
              <LocalizedAttributes><FooterAccordion title="Fitur Lamaranku" dark={dark}>
                <ul className="grid gap-3">
                  {FITUR.map((f) => (
                    <li key={f.href + f.name}><Link href={f.href}><T text={f.name} /></Link></li>
                  ))}
                </ul>
              </FooterAccordion></LocalizedAttributes>
              <LocalizedAttributes><FooterAccordion title="Hubungi Kami" dark={dark}>
                <ul className="grid gap-3">
                  <li><T text={"Malang, Jawa Timur"} /></li>
                  <li><a href={`https://wa.me/${WA_NUMBER}?text=Halo%20Lamaranku`}><T text={"Chat WhatsApp"} /></a></li>
                </ul>
              </FooterAccordion></LocalizedAttributes>
              <LocalizedAttributes><FooterAccordion title="Lamaranku" dark={dark}>
                <div><T text={"Berkas lamaran rapi dari HP. CV ATS dan surat lamaran dalam satu tempat."} /></div>
              </FooterAccordion></LocalizedAttributes>
            </div>
          </div>

          <div className="pt-6 pb-8 sm:pt-4 sm:pb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
            <span>
              <T text={"&copy; "} />{new Date().getFullYear()} <T text={"Lamaranku. All rights reserved. "} /></span>
            <span>
              <T text={"Malang, Jawa Timur, Indonesia. "} /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
