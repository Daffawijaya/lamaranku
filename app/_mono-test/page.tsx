"use client";
import { useEffect, useState } from "react";
import { preparePortfolioImage } from "../../lib/portfolio-image";

export default function MonoSelftest() {
  const [status, setStatus] = useState("idle");
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const source = await fetch("/mono-portrait-test.jpg").then((r) =>
          r.blob(),
        );
        const file = new File([source], "portrait.jpg", { type: "image/jpeg" });
        const blob = await preparePortfolioImage(file, "portrait", (stage) => {
          if (active) setStatus(stage);
        });
        if (!active) return;
        (window as unknown as { __monoResult?: Blob }).__monoResult = blob;
        setUrl(URL.createObjectURL(blob));
        setStatus(`done:${blob.type}:${blob.size}`);
      } catch (error) {
        if (active)
          setStatus(
            `error:${error instanceof Error ? error.message : String(error)}`,
          );
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return (
    <main style={{ padding: 24, fontFamily: "Arial", background: "#ddd" }}>
      <pre id="status" style={{ whiteSpace: "pre-wrap" }}>
        {status}
      </pre>
      {url && (
        <img
          id="mono-result"
          src={url}
          alt="processed portrait"
          style={{
            display: "block",
            width: 500,
            maxHeight: 700,
            objectFit: "contain",
            background:
              "repeating-conic-gradient(#bbb 0% 25%, #eee 0% 50%) 50% / 24px 24px",
          }}
        />
      )}
    </main>
  );
}
