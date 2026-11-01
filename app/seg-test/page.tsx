"use client";
import { useEffect, useState } from "react";
import { preparePortfolioImage } from "../../lib/portfolio-image";

export default function SegTest() {
  const [status, setStatus] = useState("idle");
  const [stats, setStats] = useState("");
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

        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        (window as unknown as { __segCanvas?: HTMLCanvasElement }).__segCanvas =
          canvas;

        const { width, height } = canvas;
        const data = ctx.getImageData(0, 0, width, height).data;
        let fully = 0;
        let clear = 0;
        let partial = 0;
        for (let i = 3; i < data.length; i += 4) {
          const a = data[i];
          if (a === 0) clear += 1;
          else if (a === 255) fully += 1;
          else partial += 1;
        }

        const preview = document.createElement("canvas");
        preview.width = 360;
        preview.height = Math.round((360 / width) * height);
        const pctx = preview.getContext("2d")!;
        pctx.fillStyle = "#d8d8d8";
        pctx.fillRect(0, 0, preview.width, preview.height);
        pctx.drawImage(canvas, 0, 0, preview.width, preview.height);

        if (!active) return;
        setStats(`size=${width}x${height} clear=${clear} partial=${partial} fully=${fully}`);
        setUrl(preview.toDataURL("image/png"));
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
      <pre id="stats" style={{ whiteSpace: "pre-wrap" }}>
        {stats}
      </pre>
      {url && <img id="preview" src={url} alt="preview" width={360} />}
    </main>
  );
}
