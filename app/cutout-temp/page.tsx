"use client";
import { useEffect, useState } from "react";

export default function CutoutPage() {
  const [status, setStatus] = useState("loading");
  const [url, setUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const source = await fetch("/portfolio-demo/source.jpg").then((r) =>
          r.blob(),
        );
        const blob = await removeBackground(source, {
          progress: (key) => setStatus(`progress:${key}`),
          output: { format: "image/png", quality: 0.95 },
        });
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        if (!context) throw Error("no canvas");
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        if (!cancelled) {
          setUrl(canvas.toDataURL("image/webp", 0.9));
          setStatus("done");
        }
      } catch (error) {
        if (!cancelled)
          setStatus(`error:${error instanceof Error ? error.message : error}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <p id="cutout-status">{status}</p>
      {url && <img id="cutout-result" src={url} alt="cutout" width={500} />}
    </main>
  );
}
