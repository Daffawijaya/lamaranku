"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Download, FileDiff } from "lucide-react";
import { T } from "../i18n/LanguageProvider";
import { DocumentPreview } from "../skor/DocumentPreview";
import { DOCX_MIME, isDocx } from "../../lib/cv-file";
import type { Review } from "../../lib/skor";
import "./ai-cv-repair.css";

export function AiCvRepair({ file, review }: { file: File | null; review: Review }) {
  const docx = Boolean(file && isDocx(file));
  const [plus, setPlus] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ file: File; url: string; applied: { before: string; after: string }[]; skipped: number } | null>(null);
  const request = useRef<AbortController | null>(null);
  const accessRequest = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  const checkAccess = useCallback(() => {
    accessRequest.current?.abort();
    const controller = new AbortController();
    accessRequest.current = controller;
    void fetch("/api/skor/perbaiki", { signal: controller.signal, cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Akses Plus belum dapat diperiksa.");
      if (controller.signal.aborted) return;
      setPlus(data.plus === true);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message || "Akses Plus belum dapat diperiksa."); });
  }, []);
  useEffect(() => {
    checkAccess();
    window.addEventListener("focus", checkAccess);
    return () => {
      window.removeEventListener("focus", checkAccess);
      accessRequest.current?.abort(); request.current?.abort();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [checkAccess]);

  const repair = async () => {
    if (!file || busy) return;
    setBusy(true); setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("layout", "convert-docx");
      body.set("advice", JSON.stringify({ prioritas: review.prioritas, revisi: review.revisi }).slice(0, 16_000));
      const response = await fetch("/api/skor/perbaiki", { method: "POST", body, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(180_000)]) });
      const data = await response.json();
      controller.signal.throwIfAborted();
      if (response.status === 403) { setPlus(false); throw new Error(data.error); }
      if (!response.ok) throw new Error(data.error || "CV belum dapat diperbaiki.");
      const encoded = data.docx;
      if (typeof encoded !== "string" || !Array.isArray(data.applied) || !data.applied.length) throw new Error("Dokumen hasil tidak lengkap. Coba lagi.");
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      const improved = new File([bytes], `${file.name.replace(/\.(pdf|docx)$/i, "")}-diperbaiki.docx`, { type: DOCX_MIME });
      const url = URL.createObjectURL(improved);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setResult({ file: improved, url, applied: data.applied, skipped: data.skipped });
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Perbaikan melewati batas waktu. Silakan coba lagi.");
    } finally { if (!controller.signal.aborted) setBusy(false); }
  };

  return <section className="ai-cv-repair ai-cv-repair-compact" aria-labelledby="ai-repair-title">
    <div className="ai-cv-repair-heading">
      <span className="ai-cv-repair-icon"><FileDiff size={22} strokeWidth={1.7} aria-hidden="true" /></span>
      <div className="ai-cv-repair-copy"><div className="ai-cv-repair-title-row"><h3 id="ai-repair-title"><T text="Perbaiki CV dengan AI" /></h3>
        <span className="ai-cv-repair-badge"><Crown size={11} aria-hidden="true" /><T text="Plus" /></span></div>
        <p className="ai-cv-repair-subtitle"><T text="Revisi kalimat · Hasil Word editable" /></p>
      </div>
      <span className="ai-cv-repair-actions">
    {plus === false ? <Link href="/harga" className="ai-cv-repair-button"><T text="Upgrade Plus" /></Link> :
      <button type="button" onClick={() => void repair()} aria-busy={busy} disabled={busy || plus !== true || !file || Boolean(result)} className="ai-cv-repair-button">
        <T text={busy ? "AI sedang memperbaiki CV…" : result ? "CV sudah diperbaiki" : plus === null && !error ? "Memeriksa akses Plus…" : "Perbaiki dengan AI"} />
      </button>}
      </span>
    </div>
    {!file && <p className="ai-cv-repair-note"><T text="Unggah dan review kembali PDF atau DOCX untuk membuat hasil perbaikan." /></p>}
    {busy && <p className="ai-cv-repair-note" role="status"><T text={docx ? "Merevisi kalimat dan menyiapkan DOCX. Proses ini dapat memerlukan beberapa menit." : "Mengonversi PDF ke Word, lalu merevisi teks dengan AI. Proses ini dapat memerlukan beberapa menit."} /></p>}
    {error && <div className="dash-error mt-4" role="alert"><p><T text={error} /></p>{plus === null && <button type="button" onClick={() => { setError(""); checkAccess(); }} className="mt-2 underline"><T text="Periksa akses lagi" /></button>}</div>}
    {result && <div className="ai-cv-repair-result">
      <p role="status"><T text="{0} bagian CV berhasil diperbaiki." values={[result.applied.length]} /></p>
      {result.skipped > 0 && <p className="ai-cv-repair-note"><T text="{0} revisi dilewati untuk menjaga fakta atau format dokumen. Bagian tersebut tetap memakai teks asli." values={[result.skipped]} /></p>}
      <a href={result.url} download={result.file.name} className="ai-cv-repair-button"><Download size={17} aria-hidden="true" /><T text="Unduh DOCX hasil perbaikan" /></a>
      <details><summary><T text="Lihat perubahan kalimat" /></summary><ol>{result.applied.map((change, index) => <li key={index}><p><strong><T text="Sebelum:" /></strong> {change.before}</p><p><strong><T text="Sesudah:" /></strong> {change.after}</p></li>)}</ol></details>
      <div className="ai-cv-repair-preview" data-document-preview><DocumentPreview file={result.file} /></div>
    </div>}
  </section>;
}
