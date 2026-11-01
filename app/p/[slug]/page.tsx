import { notFound, permanentRedirect } from "next/navigation";
import { validPortfolioSlug } from "../../../lib/portfolio";

// Alamat lama `/p/<slug>` dipindahkan ke `/<slug>`. Redirect permanen menjaga
// link yang sudah dibagikan tetap hidup.
export default async function LegacyPortfolio({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!validPortfolioSlug(slug)) notFound();
  permanentRedirect(`/${slug}`);
}
