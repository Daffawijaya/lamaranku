import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "Lamaranku - CV, Skor, Portfolio & Surat Lamaran",
  description:
    "Lamaranku: CV Builder, Cek Skor CV, Portfolio Builder, dan Generator Surat. Gratis untuk mulai, Plus untuk hasil maksimal tanpa watermark."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${myriad.variable} ${myriadCondensed.variable}`}>
      <body className="bg-white font-sans text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
