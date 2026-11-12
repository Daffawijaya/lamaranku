import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Halaman noindex (dashboard, auth, …) tetap bisa di-crawl supaya header
    // X-Robots-Tag terlihat Google. Yang diblokir hanya endpoint API.
    rules: process.env.VERCEL_ENV === "preview"
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
