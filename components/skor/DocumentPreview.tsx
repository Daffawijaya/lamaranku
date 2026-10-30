"use client";

import { useEffect, useState } from "react";
import { isDocx } from "../../lib/cv-file";
import { T } from "../i18n/LanguageProvider";
import { PdfPreview } from "./PdfPreview";

export function DocumentPreview({ file }: { file: File }) {
  return isDocx(file) ? <DocxTextPreview file={file} /> : <PdfPreview file={file} />;
}

function DocxTextPreview({ file }: { file: File }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setText(""); setError("");
    void (async () => {
      const { openRepairDocx } = await import("../../lib/docx-repair");
      const doc = openRepairDocx(new Uint8Array(await file.arrayBuffer()));
      try { if (active) setText(doc.text); }
      finally { doc.close(); }
    })().catch(error => { if (active) setError(error instanceof Error ? error.message : "DOCX tidak dapat dibaca."); });
    return () => { active = false; };
  }, [file]);
  return <div data-document-preview className="max-h-[65vh] overflow-y-auto rounded-xl bg-white p-5 text-zinc-800" style={{ backgroundColor: "#fff", color: "#202020", colorScheme: "light" }}>
    <p className="mb-4 text-xs leading-5" style={{ color: "#666" }}><T text="Pratinjau teks DOCX. Buka di Word atau Google Docs untuk melihat tata letak lengkap." /></p>
    {error ? <p role="alert" style={{ color: "#b91c1c" }}><T text={error} /></p> : text ? <div className="whitespace-pre-wrap break-words text-sm leading-7" style={{ color: "#202020" }}>{text}</div> : <p role="status" style={{ color: "#666" }}><T text="Membaca DOCX…" /></p>}
  </div>;
}
