"use client";
import { useEffect, useState } from "react";
import { PortfolioWebsite } from "../../../components/portfolio/PortfolioWebsite";
import { DEMO_WEB_PORTFOLIO, parseWebPortfolio } from "../../../lib/portfolio";

export default function PortfolioPreview() {
  const [preview, setPreview] = useState({
    document: DEMO_WEB_PORTFOLIO,
    demo: true,
  });
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "lamaranku:portfolio-preview"
      )
        return;
      try {
        setPreview({
          document: parseWebPortfolio(event.data.document),
          demo: event.data.demo === true,
        });
      } catch {
        /* Ignore incomplete preview messages. */
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage(
      { type: "lamaranku:portfolio-preview-ready" },
      window.location.origin,
    );
    return () => window.removeEventListener("message", receive);
  }, []);
  return <PortfolioWebsite data={preview.document} demo={preview.demo} />;
}
