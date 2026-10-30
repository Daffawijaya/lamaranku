"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Download, FileDiff, Loader2 } from "lucide-react";
import { ConfirmModal } from "../ui/ConfirmModal";
import { T } from "../i18n/LanguageProvider";
import { DocumentPreview } from "../skor/DocumentPreview";
import { DOCX_MIME } from "../../lib/cv-file";
import type { Review } from "../../lib/skor";
import type { CvAnswer, CvQuestion } from "../../lib/cv-clarifications";
import type { SkippedCvRevision } from "../../lib/docx-repair";
import { CvClarificationDialog } from "./CvClarificationDialog";
import { CvRevisionApprovalDialog } from "./CvRevisionApprovalDialog";
import type { CvRevisionProposal } from "../../lib/cv-revision-approval";
import "./ai-cv-repair.css";

export function AiCvRepair({ file, review }: { file: File | null; review: Review }) {
  const [plus, setPlus] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ file: File; url: string; applied: { before: string; after: string }[]; skipped: number; skippedDetails: SkippedCvRevision[] } | null>(null);
  const [questions, setQuestions] = useState<CvQuestion[] | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [skippedAttempts, setSkippedAttempts] = useState<SkippedCvRevision[]>([]);
  const [proposals, setProposals] = useState<CvRevisionProposal[] | null>(null);
  const [notice, setNotice] = useState("");
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

  const repair = async (answers: CvAnswer[] = [], approved?: CvRevisionProposal[]) => {
    if (!file || busy) return;
    setBusy(true); setError(""); setSkippedAttempts([]); setNotice("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("layout", "convert-docx");
      body.set("advice", JSON.stringify({ prioritas: review.prioritas, revisi: review.revisi }).slice(0, 16_000));
      body.set("answers", JSON.stringify(answers));
      body.set("action", approved ? "apply" : "propose");
      if (approved) body.set("approved", JSON.stringify(approved));
      const response = await fetch("/api/skor/perbaiki", { method: "POST", body, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(180_000)]) });
      const data = await response.json();
      controller.signal.throwIfAborted();
      if (response.status === 403) { setPlus(false); throw new Error(data.error); }
      if (!response.ok) {
        if (Array.isArray(data.skippedDetails)) setSkippedAttempts(data.skippedDetails);
        throw new Error(data.error || "CV belum dapat diperbaiki.");
      }
      if (!approved) {
        if (!Array.isArray(data.proposals)) throw new Error("Usulan revisi belum lengkap. Coba lagi.");
        if (data.proposals.length) setProposals(data.proposals);
        else setNotice("AI tidak mengusulkan perubahan baru. Teks asli tetap dipertahankan.");
        return;
      }
      const encoded = data.docx;
      if (typeof encoded !== "string" || !Array.isArray(data.applied) || !data.applied.length) throw new Error("Dokumen hasil tidak lengkap. Coba lagi.");
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      const improved = new File([bytes], `${file.name.replace(/\.(pdf|docx)$/i, "")}-diperbaiki.docx`, { type: DOCX_MIME });
      const url = URL.createObjectURL(improved);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setResult({ file: improved, url, applied: data.applied, skipped: data.skipped, skippedDetails: Array.isArray(data.skippedDetails) ? data.skippedDetails : [] });
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Perbaikan melewati batas waktu. Silakan coba lagi.");
    } finally { if (!controller.signal.aborted) setBusy(false); }
  };

  const prepareQuestions = async () => {
    if (!file || busy || plus !== true) return;
    setBusy(true); setPreparing(true); setError(""); setSkippedAttempts([]); setNotice("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const body = new FormData();
      body.set("file", file); body.set("action", "questions");
      body.set("advice", JSON.stringify({ prioritas: review.prioritas, revisi: review.revisi }).slice(0, 16_000));
      const response = await fetch("/api/skor/perbaiki", { method: "POST", body, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(180_000)]) });
      const data = await response.json();
      controller.signal.throwIfAborted();
      if (response.status === 403) setPlus(false);
      if (!response.ok) throw new Error(data.error || "Pertanyaan belum dapat disiapkan.");
      if (!Array.isArray(data.questions)) throw new Error("Pertanyaan AI belum valid. Coba lagi.");
      setPreparing(false);
      if (data.questions.length) setQuestions(data.questions);
      else await repair();
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Proses melewati batas waktu. Coba lagi.");
    } finally {
      if (!controller.signal.aborted) { setBusy(false); setPreparing(false); }
    }
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
      <button type="button" onClick={() => void prepareQuestions()} aria-busy={busy} disabled={busy || plus !== true || !file || Boolean(result) || Boolean(questions) || Boolean(proposals)} className="ai-cv-repair-button">
        <T text={preparing ? "Menyiapkan pertanyaan…" : busy ? "AI sedang memperbaiki CV…" : result ? "CV sudah diperbaiki" : plus === null && !error ? "Memeriksa akses Plus…" : "Perbaiki dengan AI"} />
      </button>}
      </span>
    </div>
    {!file && <p className="ai-cv-repair-note"><T text="Unggah dan review kembali PDF atau DOCX untuk membuat hasil perbaikan." /></p>}
    {busy && !questions && !proposals && <ConfirmModal pending title={preparing ? "Menyiapkan pertanyaan…" : "AI sedang memperbaiki CV…"}
      className="ai-cv-processing-modal" confirmLabel="Memproses…" onConfirm={() => {}} onClose={() => {}}>
      <div className="ai-cv-processing-status" role="status" aria-live="polite">
        <span className="ai-cv-processing-spinner" aria-hidden="true"><Loader2 size={28} className="animate-spin" /></span>
        <p><T text={preparing ? "Menyiapkan pertanyaan…" : "Sedang menyiapkan hasil. Mohon tunggu sebentar."} /></p>
      </div>
    </ConfirmModal>}
    {questions && <CvClarificationDialog questions={questions} onClose={() => setQuestions(null)} onComplete={answers => { setQuestions(null); void repair(answers); }} />}
    {proposals && <CvRevisionApprovalDialog proposals={proposals} onClose={() => setProposals(null)} onComplete={approved => {
      setProposals(null);
      if (approved.length) void repair([], approved);
      else setNotice("Tidak ada revisi yang dipilih. Semua bagian tetap memakai teks asli.");
    }} />}
    {notice && <p className="ai-cv-repair-note" role="status"><T text={notice} /></p>}
    {error && <div className="dash-error mt-4" role="alert"><p><T text={error} /></p>{plus === null && <button type="button" onClick={() => { setError(""); checkAccess(); }} className="mt-2 underline"><T text="Periksa akses lagi" /></button>}</div>}
    {!result && skippedAttempts?.length > 0 && <SkippedRevisions revisions={skippedAttempts} />}
    {result && <div className="ai-cv-repair-result">
      <p role="status"><T text="{0} bagian CV berhasil diperbaiki." values={[result.applied.length]} /></p>
      {result.skipped > 0 && <p className="ai-cv-repair-note"><T text="{0} revisi dilewati untuk menjaga fakta atau format dokumen. Bagian tersebut tetap memakai teks asli." values={[result.skipped]} /></p>}
      {result.skippedDetails.length > 0 && <SkippedRevisions revisions={result.skippedDetails} />}
      <a href={result.url} download={result.file.name} className="ai-cv-repair-button"><Download size={17} aria-hidden="true" /><T text="Unduh DOCX hasil perbaikan" /></a>
      <details><summary><T text="Lihat perubahan kalimat" /></summary><ol>{result.applied.map((change, index) => <li key={index}><p><strong><T text="Sebelum:" /></strong> {change.before}</p><p><strong><T text="Sesudah:" /></strong> {change.after}</p></li>)}</ol></details>
      <div className="ai-cv-repair-preview" data-document-preview><DocumentPreview file={result.file} /></div>
    </div>}
  </section>;
}

function SkippedRevisions({ revisions }: { revisions: SkippedCvRevision[] }) {
  return <details className="ai-cv-repair-skipped">
    <summary><T text="Lihat alasan {0} revisi dilewati" values={[revisions.length]} /></summary>
    <ol>{revisions.map((revision, index) => <li key={revision.id}>
      <p><strong><T text="Bagian {0}" values={[index + 1]} /></strong></p>
      {revision.reasons.includes("facts") && <p className="ai-cv-repair-note"><T text="Angka, tanggal, atau kontak diubah, dihapus, dipindahkan, atau ditambahkan tanpa konfirmasi untuk bagian ini." /></p>}
      {revision.reasons.includes("length") && <p className="ai-cv-repair-note"><T text="Usulan AI lebih panjang ({0} karakter) daripada teks asli ({1} karakter), sehingga berisiko menggeser tata letak." values={[revision.after.length, revision.before.length]} /></p>}
      <p><strong><T text="Teks asli:" /></strong> {revision.before}</p>
      <p><strong><T text="Usulan AI (tidak diterapkan):" /></strong> {revision.after}</p>
    </li>)}</ol>
  </details>;
}
