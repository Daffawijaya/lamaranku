import type { Metadata } from "next";
import localFont from "next/font/local";
import TopLoader from "../components/jds/TopLoader";
import { pageMetadata, SITE_URL } from "../lib/seo";
import "./globals.css";

const myriad = localFont({
  src: [
    { path: "./fonts/myriadpro-regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/myriadpro-semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/myriadpro-bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/myriadpro-black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-myriad",
  display: "swap",
});

const myriadCondensed = localFont({
  src: [
    { path: "./fonts/myriadpro-cond.otf", weight: "400", style: "normal" },
    { path: "./fonts/myriadpro-boldcond.otf", weight: "700", style: "normal" },
    { path: "./fonts/myriadpro-blackcond.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-myriad-display",
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMetadata("/", "Buat CV ATS & Portofolio Gratis", "Bikin CV ATS dan portofolio gratis dengan Lamaranku. Pilih template CV, isi pengalaman, unduh PDF, dan review CV dengan AI. Basic gratis, Plus opsional."),
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
      <body className="bg-white font-sans text-zinc-900 antialiased"><TopLoader />{children}</body>
    </html>
  );
}
