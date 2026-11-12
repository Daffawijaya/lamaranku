import type { Metadata } from "next";
import localFont from "next/font/local";
import TopLoader from "../components/jds/TopLoader";
import { SITE_URL } from "../lib/seo";
import "./globals.css";
import { LanguageProvider } from "../components/i18n/LanguageProvider";

// Font dipangkas ke set latin + latin-ext, tanda baca, dan panah (hanya
// glif yang dipakai situs) lalu dikompres WOFF2 — sekitar 4x lebih kecil.
// Subset hanya dideklarasikan sekali di <html>, tidak di-preload berulang.
const myriad = localFont({
  src: [
    { path: "./fonts/myriadpro-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/myriadpro-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/myriadpro-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/myriadpro-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-myriad",
  display: "swap",
});

// Hanya dipakai di pratinjau CV; unduh saat dipakai, bukan di setiap halaman.
const myriadCondensed = localFont({
  src: [
    { path: "./fonts/myriadpro-cond.woff2", weight: "400", style: "normal" },
    { path: "./fonts/myriadpro-boldcond.woff2", weight: "700", style: "normal" },
    { path: "./fonts/myriadpro-blackcond.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-myriad-display",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  // Halaman publik masing-masing membawa metadata sendiri (lib/seo.ts); layout
  // hanya membawa properti default agar halaman tanpa metadata tidak mewarisi
  // canonical halaman utama.
  metadataBase: new URL(SITE_URL),
  title: { default: "Buat CV ATS & Portofolio Gratis | Lamaranku", template: "%s | Lamaranku" },
  applicationName: "Lamaranku",
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${myriad.variable} ${myriadCondensed.variable}`}>
      <body className="bg-white font-sans text-zinc-900 antialiased"><LanguageProvider><TopLoader />{children}</LanguageProvider></body>
    </html>
  );
}
