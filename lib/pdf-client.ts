import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs";

// Keep the worker and the PDF.js API on the same installed package version.
export async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}
