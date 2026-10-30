"use client";

import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
  return (
    <NextTopLoader
      color="var(--app-loading-accent, #3b63fb)"
      initialPosition={0.08}
      crawlSpeed={300}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="cubic-bezier(0.22, 1, 0.36, 1)"
      speed={600}
      shadow="none"
    />
  );
}
