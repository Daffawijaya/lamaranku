import { PortfolioPreviewClient } from "../../../components/portfolio/PortfolioPreviewClient";
import { PORTFOLIO_TEMPLATES } from "../../../lib/portfolio";

export default async function PortfolioPreview({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  // Thumbnail iframes memakai ?template=… supaya dokumen pertama yang
  // dirender sudah tema yang benar, tanpa menunggu pesan dari studio.
  const initialTemplate = PORTFOLIO_TEMPLATES.find(
    (item) => item.id === template,
  )?.id;
  return <PortfolioPreviewClient initialTemplate={initialTemplate} />;
}
