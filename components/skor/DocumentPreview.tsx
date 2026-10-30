"use client";
import { useEffect, useRef, useState } from "react";
import { isDocx } from "../../lib/cv-file";
import { T } from "../i18n/LanguageProvider";
import { PdfPreview } from "./PdfPreview";

export function DocumentPreview({ file }: { file: File }) {
  return isDocx(file) ? <DocxPreview file={file} /> : <PdfPreview file={file} />;
}
function DocxPreview({ file }: { file: File }) {
  const host = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | undefined;
    const element = host.current!;
    const shadow = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    shadow.replaceChildren();
    setBusy(true); setError("");
    void (async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { openRepairDocx } = await import("../../lib/docx-repair");
      const validation = openRepairDocx(bytes); validation.close();
      const container = document.createElement("div");
      const { renderConvertedDocx } = await import("../../lib/render-docx-preview");
      if (!renderConvertedDocx(bytes, container)) {
        const { renderAsync } = await import("docx-preview");
        await renderAsync(bytes, container, undefined, { inWrapper: false, ignoreLastRenderedPageBreak: false, useBase64URL: true, renderAltChunks: false });
      }
      if (!active) return;
      const style = document.createElement("style");
      style.textContent = ":host{display:block;color:#202020;color-scheme:light}section{box-sizing:border-box;background:white;margin:0 auto 16px;box-shadow:0 1px 5px #0002}a{pointer-events:none}*{box-sizing:border-box}";
      shadow.append(style, container);
      await document.fonts.ready;
      await Promise.all(Array.from(container.querySelectorAll("img"), img => img.decode().catch(() => {})));
      if (!active) return;
      const { strFromU8, unzipSync } = await import("fflate");
      const documentXml = strFromU8(unzipSync(bytes, { filter: entry => entry.name === "word/document.xml" })["word/document.xml"]);
      if (documentXml.includes("urn:lamaranku:cv-flow:1")) {
        const { paginateDocxPreview } = await import("../../lib/paginate-docx-preview");
        paginateDocxPreview(container);
      }
      const resize = () => {
        container.style.setProperty("zoom", "1");
        const width = Math.max(...Array.from(container.querySelectorAll("section")).map(page => page.getBoundingClientRect().width), 1);
        container.style.setProperty("zoom", String(Math.min(1, element.clientWidth / width)));
      };
      resize();
      observer = new ResizeObserver(resize); observer.observe(element);
      setBusy(false);
    })().catch(error => { if (active) { setError(error instanceof Error ? error.message : "Pratinjau DOCX tidak dapat dibuka."); setBusy(false); } });
    return () => { active = false; observer?.disconnect(); shadow.replaceChildren(); };
  }, [file]);
  return <div data-document-preview className="max-h-[65vh] overflow-y-auto rounded-xl p-3" style={{ background: "#e5e7eb", color: "#202020", colorScheme: "light" }}>
    {busy && <p role="status"><T text="Memuat pratinjau DOCX…" /></p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}><T text={error} /></p>}
    <div ref={host} />
  </div>;
}
