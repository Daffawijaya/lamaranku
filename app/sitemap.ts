import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE_URL } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Gunakan bentuk tanpa trailing slash agar identik dengan canonical Next.js.
  return PUBLIC_PATHS.map(path => ({
    url: path === "/" ? SITE_URL : new URL(path, SITE_URL).href,
  }));
}
