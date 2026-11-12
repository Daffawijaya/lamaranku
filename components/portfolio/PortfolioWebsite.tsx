import type { WebPortfolio } from "../../lib/portfolio";
import { MinimalistPortfolio } from "./MinimalistPortfolio";
import { MonoPortfolio } from "./MonoPortfolio";
import { PosterPortfolio } from "./PosterPortfolio";
import { VividPortfolio } from "./VividPortfolio";
import { AbrantesPortfolio } from "./AbrantesPortfolio";
import { ModularPortfolio } from "./ModularPortfolio";
import "./minimalist-theme.css";
import "./portfolio-website.css";

export function PortfolioWebsite({ data }: { data: WebPortfolio }) {
  if (data.template === "mono") return <MonoPortfolio data={data} />;
  if (data.template === "vivid") return <VividPortfolio data={data} />;
  if (data.template === "poster") return <PosterPortfolio data={data} />;
  if (data.template === "abrantes") return <AbrantesPortfolio data={data} />;
  if (data.template === "modular") return <ModularPortfolio data={data} />;
  // parseWebPortfolio menormalkan tema lama (termasuk "bento") ke minimalist,
  // jadi jatuh ke Minimalist di sini hanya pengaman.
  return <MinimalistPortfolio data={data} />;
}
