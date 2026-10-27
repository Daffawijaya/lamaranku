import type { Metadata } from "next";

export const SITE_NAME = "Lamaranku";
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lamaranku.vercel.app").origin;
const preview = process.env.VERCEL_ENV === "preview";

export const PUBLIC_PATHS = ["/", "/cv-builder", "/cv-ats", "/portfolio", "/skor", "/surat", "/harga"];

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  const images = [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Lamaranku — CV ATS dan Portofolio Gratis" }];
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: !preview, follow: true },
    openGraph: { type: "website", locale: "id_ID", siteName: SITE_NAME, url, title: `${title} | ${SITE_NAME}`, description, images },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: images.map(image => image.url) },
  };
}

export function featureSchema(path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebApplication", "@id": `${SITE_URL}${path}#app`, name, description, url: `${SITE_URL}${path}`, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: "id", isAccessibleForFree: true, publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
      ] },
    ],
  };
}
