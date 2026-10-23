"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPdfJs } from "../../lib/pdf-client";

// Render document pages ourselves so browser PDF controls never appear.
export function PdfPreview({ file }: { file: File }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let disposed = false;
    let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    setDocument(null);
    setError("");
    void (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = await file.arrayBuffer();
        if (disposed) return;
        task = pdfjs.getDocument({ data });
        const pdf = await task.promise;
        if (disposed) return;
        if (pdf.numPages > 50) throw new Error("Pratinjau mendukung maksimal 50 halaman.");
        setDocument(pdf);
      } catch (e) {
        if (!disposed) setError(e instanceof Error ? e.message : "Pratinjau PDF tidak dapat dibuka.");
      }
    })();
    return () => { disposed = true; void task?.destroy().catch(() => {}); };
  }, [file]);

  return <div className="h-[50vh] overflow-y-auto overscroll-contain lg:h-[calc(100svh-7rem)]" role="region" aria-label={`Pratinjau ${file.name}`} tabIndex={0}>
    {error ? <p role="alert" className="p-5 text-sm text-red-700">{error}</p> : document ? <div className="space-y-4">{Array.from({ length: document.numPages }, (_, i) => <PdfPage key={i} pdf={document} number={i + 1} />)}</div> : <p role="status" className="p-5 text-sm text-zinc-500">Memuat pratinjau PDF…</p>}
  </div>;
}

function PdfPage({ pdf, number }: { pdf: PDFDocumentProxy; number: number }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    void (async () => {
      try {
        const page = await pdf.getPage(number);
        if (disposed || !canvas.current) return;
        const base = page.getViewport({ scale: 1 });
        const width = Math.min(1600, Math.max(600, (host.current?.clientWidth || 800) * Math.min(window.devicePixelRatio || 1, 2)));
        const viewport = page.getViewport({ scale: Math.min(width / base.width, 2400 / base.height) });
        canvas.current.width = Math.ceil(viewport.width);
        canvas.current.height = Math.ceil(viewport.height);
        render = page.render({ canvas: canvas.current, viewport });
        await render.promise;
        page.cleanup();
      } catch { if (!disposed) setError(true); }
    })();
    return () => { disposed = true; render?.cancel(); };
  }, [pdf, number, visible]);

  return <div ref={host} className="min-h-48 bg-white shadow-sm">
    {error ? <p className="p-4 text-sm text-red-700">Halaman {number} tidak dapat ditampilkan.</p> : <canvas ref={canvas} role="img" aria-label={`Halaman ${number}`} className="block h-auto w-full" />}
  </div>;
}
