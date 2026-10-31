import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import {
  parseWebPortfolio,
  portfolioImageUrl,
  validPortfolioSlug,
} from "../../../lib/portfolio";
import { PortfolioWebsite } from "../../../components/portfolio/PortfolioWebsite";
import { SITE_URL } from "../../../lib/seo";

export const dynamic = "force-dynamic";
const load = cache(async (slug: string) => {
  if (!validPortfolioSlug(slug)) return null;
  const db = await supabaseServer();
  const { data, error } = await db.rpc("get_public_portfolio", {
    site_slug: slug,
  });
  if (error || !data?.document) return null;
  try {
    return parseWebPortfolio(data.document);
  } catch {
    return null;
  }
});
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data)
    return {
      title: "Portofolio tidak tersedia",
      robots: { index: false, follow: false },
    };
  const title = data.seoTitle || `${data.name} — ${data.role}`;
  const description =
    data.seoDescription ||
    data.bio.slice(0, 180) ||
    `Portofolio ${data.name}, ${data.role}. Lihat karya dan hubungi untuk berkolaborasi.`;
  const url = `${SITE_URL}/p/${slug}`;
  const image = portfolioImageUrl(
    data.avatar || data.projects.find((p) => p.image)?.image || "",
  );
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
export default async function PublicPortfolio({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  return <PortfolioWebsite data={data} />;
}
