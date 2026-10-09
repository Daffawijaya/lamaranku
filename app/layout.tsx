import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lamaranku - CV, Surat Lamaran, Portfolio & Career Academy",
  description:
    "Lamaranku: bikin CV ATS, surat lamaran, website portfolio, dan ikut Career Academy. Gratis untuk mulai, Plus untuk hasil maksimal tanpa watermark."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${outfit.className} bg-white`}>{children}</body>
    </html>
  );
}
