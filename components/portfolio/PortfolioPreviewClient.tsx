"use client";
import { useEffect, useState } from "react";
import { PortfolioWebsite } from "./PortfolioWebsite";
import {
  DEMO_WEB_PORTFOLIO,
  DEMO_WEB_PORTFOLIOS,
  parseWebPortfolio,
  type PortfolioTemplate,
} from "../../lib/portfolio";

export function PortfolioPreviewClient({
  initialTemplate,
}: {
  initialTemplate?: PortfolioTemplate;
}) {
  const [preview, setPreview] = useState(() => ({
    document: initialTemplate
      ? DEMO_WEB_PORTFOLIOS[initialTemplate]
      : DEMO_WEB_PORTFOLIO,
    demo: true,
  }));

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "lamaranku:portfolio-preview"
      )
        return;
      try {
        const demo = event.data.demo === true;
        setPreview({
          document: parseWebPortfolio(event.data.document, undefined, {
            allowRemoteImages: demo,
          }),
          demo,
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
