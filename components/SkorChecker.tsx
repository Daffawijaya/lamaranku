"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { savePendingReview, readPendingReview, deletePendingReview } from "../lib/pending-review";
import { PdfPreview } from "./skor/PdfPreview";
import { CRITERIA, type Point, type Review } from "../lib/skor";
import { loadPdfJs } from "../lib/pdf-client";
import { supabaseBrowser } from "../lib/supabase/client";
import { Check, FileText, FileUp, Gauge, Loader2, Minus, RotateCcw, ShieldCheck, X } from "lucide-react";

const MAX_PDF_MB = 5;
const MAX_READ_PAGES = 50;

const ITEMS = CRITERIA;
type AiPoint = Point;
type Phase = "awal" | "siap" | "lanjut" | "baca" | "nilai" | "validasi" | "hasil" | "gagal";

function isAiPoint(value: unknown): value is AiPoint {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && (v.status === "ya" || v.status === "tidak" || v.status === "ragu") && typeof v.catatan === "string";
}

// Ekstraksi teks dilakukan lokal setelah sesi login diperiksa.
async function extractPdf(file: File, onProgress: (current: number, total: number) => void): Promise<{ text: string; pages: number }> {
  const pdfjs = await loadPdfJs();
  const pdfTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const pdf = await pdfTask.promise;
  try {
    if (pdf.numPages > MAX_READ_PAGES) throw new Error("PDF maksimal 50 halaman; tidak ada halaman yang dipotong.");
    const n = pdf.numPages;
    onProgress(0, n);
    let text = "";
    for (let i = 1; i <= n; i++) {
      const page = await pdf.getPage(i);
      try {
        const content = await page.getTextContent();
        text += content.items.map((it) => { const item = it as { str?: string; hasEOL?: boolean }; return (item.str ?? "") + (item.hasEOL ? "\n" : " "); }).join("") + "\n";
        if (text.length > 80000) throw new Error("Teks CV maksimal 80.000 karakter.");
        onProgress(i, n);
      } finally {
        page.cleanup();
      }
    }
    return { text, pages: pdf.numPages };
  } finally {
    await pdfTask.destroy().catch(() => {});
  }
}

function verdictFor(score: number): string {
  if (score < 50) return "Perlu banyak perbaikan sebelum dikirim.";
  if (score < 80) return "Cukup. Poles bagian yang belum terisi.";
  return "Siap kirim. Tinggal sesuaikan keyword per lowongan.";
}

export function useSkor(inDashboard = false) {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("awal");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [ai, setAi] = useState<AiPoint[]>([]);
  const [staged, setStaged] = useState<File | null>(null);
  const [confirmFile, setConfirmFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [readProgress, setReadProgress] = useState({ current: 0, total: 0 });
  const [totalElapsed, setTotalElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const busyRef = useRef(false);
  const busy = phase === "lanjut" || phase === "baca" || phase === "nilai" || phase === "validasi";

  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    setTotalElapsed(0);
    const timer = window.setInterval(() => setTotalElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (phase !== "nilai") { setElapsed(0); return; }
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Dipilih/diseret dulu, dinilai setelah tekan "Cek Skor".
  const stage = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("File harus PDF.");
      setStaged(null);
      setAi([]); setReview(null);
      setPhase("gagal");
      return;
    }
    if (file.size === 0) {
      setError("PDF kosong atau rusak.");
      setStaged(null);
      setAi([]); setReview(null);
      setPhase("gagal");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`PDF maksimal ${MAX_PDF_MB}MB.`);
      setStaged(null);
      setAi([]); setReview(null);
      setPhase("gagal");
      return;
    }
    setError("");
    setAi([]); setReview(null);
    setStaged(file);
    setFileName(file.name);
    setConfirmFile(file);
    setReplacing(false);
    setPhase("siap");
  };

  const continueInDashboard = async (file: File, job = jobDescription) => {
    setPhase("lanjut");
    setStatus("Menyiapkan dokumen. Review AI dimulai di dashboard setelah login…");
    const id = crypto.randomUUID();
    await savePendingReview(id, { file, jobDescription: job, createdAt: Date.now() });
    router.push("/dashboard/skor?draft=" + encodeURIComponent(id));
  };

  const executeReview = async (file: File, jobOverride?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestRef.current;
    const alive = () => requestRef.current === requestId && !controller.signal.aborted;

    setError("");
    setFileName(file.name);
    setReadProgress({ current: 0, total: 0 });
    try {
      setPhase("lanjut");
      setStatus("Memeriksa sesi login sebelum review CV…");
      const { data: { user }, error: authError } = await supabaseBrowser().auth.getUser();
      if (!alive()) return;
      if (authError && authError.name !== "AuthSessionMissingError") {
        throw new Error("Sesi login belum dapat diperiksa. Silakan masuk kembali lalu coba review CV.");
      }
      if (!user) {
        await continueInDashboard(file, jobOverride ?? jobDescription);
        return;
      }
      setPhase("baca");
      setStatus("Membaca PDF di perangkatmu…");
      const { text, pages } = await extractPdf(file, (current, total) => {
        if (alive()) setReadProgress({ current, total });
      });
      if (!alive()) return;
      if (text.trim().length < 50) throw new Error("Teks tidak terbaca (mungkin hasil scan foto).");
      setPhase("nilai");
      setStatus("AI menelaah bukti, kecocokan, dan prioritas perbaikan…");
      const res = await fetch("/api/skor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pages, jobDescription: jobOverride ?? jobDescription }),
        signal: controller.signal,
      });
      if (!alive()) return;
      if (res.ok) {
        setPhase("validasi");
        setStatus("Memeriksa hasil review dan menyiapkan skor serta saran perbaikan…");
      }
      const data = await res.json().catch(() => null);
      if (!alive()) return;
      if (!res.ok) throw new Error(data?.error ?? "Penilaian gagal.");
      if (!Array.isArray(data?.poin)) throw new Error("Jawaban AI tidak lengkap. Coba lagi.");
      const points = data.poin.filter(isAiPoint);
      if (points.length === 0) throw new Error("Jawaban AI tidak lengkap. Coba lagi.");
      setAi(points); setReview(data as Review);
      setRingkasan(typeof data.ringkasan === "string" && data.ringkasan ? data.ringkasan : verdictFor(0));
      setPhase("hasil");
      setConfirmFile(null);
    } catch (e) {
      if (!alive()) return;
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Gagal menganalisis.");
      setPhase("gagal");
    }
  };

  const analyze = async (file: File) => {
    if (inDashboard) {
      setConfirmFile(null);
      await executeReview(file);
      return;
    }
    setError("");
    try {
      await continueInDashboard(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dokumen tidak dapat disimpan sementara."); setPhase("gagal");
    }
  };

  const executeRef = useRef(executeReview);
  executeRef.current = executeReview;
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!inDashboard) return;
    const id = new URLSearchParams(window.location.search).get("draft");
    if (!id) return;
    let alive = true;
    void (async () => {
      try {
        const draft = await readPendingReview(id);
        if (!alive || resumedRef.current) return;
        resumedRef.current = true;
        if (!draft) throw new Error("Dokumen sementara tidak tersedia atau kedaluwarsa. Upload PDF kembali.");
        setJobDescription(draft.jobDescription);
        setStaged(draft.file);
        await executeRef.current(draft.file, draft.jobDescription);
        if (alive) {
          await deletePendingReview(id);
          window.history.replaceState(null, "", "/dashboard/skor");
        }
      } catch (e) {
        if (alive) { setError(e instanceof Error ? e.message : "Gagal memulihkan dokumen."); setPhase("gagal"); }
      }
    })();
    return () => { alive = false; };
  }, [inDashboard]);

  const reset = () => {
    requestRef.current += 1;
    abortRef.current?.abort();
    setPhase("awal");
    setError("");
    setFileName("");
    setAi([]); setReview(null);
    setStaged(null);
    setConfirmFile(null);
    setReplacing(false);
    setReadProgress({ current: 0, total: 0 });
    setTotalElapsed(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Halaman publik melanjutkan ke dashboard; AI hanya berjalan sesudah login.
  const confirm = () => {
    if (busyRef.current) return;
    const file = staged;
    if (file && !replacing) {
      busyRef.current = true;
      void analyze(file);
    }
  };
  const dismissConfirm = () => { if (!busyRef.current) setConfirmFile(null); };
  const replaceDoc = () => {
    if (busyRef.current) return;
    setReplacing(true);
    setStaged(null);
    setAi([]); setReview(null);
    setError("");
    setPhase("awal");
    if (inputRef.current) inputRef.current.value = "";
  };

  busyRef.current = busy;

  return { elapsed, totalElapsed, readProgress, review, jobDescription, setJobDescription, phase, status, error, fileName, ringkasan, ai, staged, confirmFile, replacing, inputRef, busyRef, busy, stage, analyze, reset, confirm, dismissConfirm, replaceDoc };
}

export type Skor = ReturnType<typeof useSkor>;

export function SkorUploadPill({ s }: { s: Skor }) {
  const { elapsed, phase, status, error, fileName, staged, inputRef, busyRef, busy, stage, analyze } = s;

  // Tarik & lepas ke mana saja di halaman ini.
  useEffect(() => {
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      if (busyRef.current) return;
      const f = e.dataTransfer?.files?.[0];
      if (f) {
        if (inputRef.current) inputRef.current.value = "";
        stage(f);
      }
    };
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("drop", drop);
    };
  }, [inputRef, busyRef, stage]);

  const prompt = phase === "awal" || phase === "gagal" || phase === "hasil";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        aria-label="Upload CV PDF"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) stage(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex w-full max-w-[560px] flex-col items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-center transition-colors hover:border-zinc-900 disabled:opacity-70"
      >
        {busy ? (
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
        ) : (
          <FileUp className="h-10 w-10 text-zinc-900" />
        )}
        <span className="mt-4 w-full max-w-full truncate text-lg font-bold text-zinc-900">
          {phase === "siap" ? fileName : prompt ? "Upload CV PDF-mu" : status}
        </span>
        <span className="mt-1 max-w-sm text-sm text-zinc-600">
          {phase === "siap"
            ? "Klik atau seret PDF lain untuk mengganti."
            : prompt
              ? `Klik untuk pilih file (maks ${MAX_PDF_MB}MB). Review AI dimulai di dashboard setelah login.`
              : phase === "lanjut" ? "Dokumen disimpan sementara di browser agar bisa dilanjutkan."
              : phase === "nilai" ? `Menunggu respons AI · ${elapsed} detik${elapsed >= 30 ? ". Respons penyedia AI sedang lambat; batas tunggu 75 detik." : ". Analisis sedang diproses."}` : "Membaca dokumen…"}
        </span>
      </button>

      {phase === "siap" && staged && (
        <button
          type="button"
          onClick={() => void analyze(staged)}
          className="mt-4 inline-flex min-h-[52px] w-full max-w-[560px] items-center justify-center gap-2 rounded-xl bg-[#1c64f2] px-6 py-3 text-base font-bold text-white transition-colors hover:bg-[#1a56db]"
        >
          <Gauge className="h-5 w-5" /> Cek Skor
        </button>
      )}

      {phase === "gagal" && (
        <div className="mt-4 w-full max-w-[560px] rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
          <p className="font-bold text-red-900">Gagal menilai.</p>
          <p className="mt-1 text-sm text-red-800">{error}</p>
          {staged && <button type="button" onClick={() => void analyze(staged)} className="mt-3 rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white">Coba review lagi</button>}
        </div>
      )}

      <p className="mt-4 flex max-w-[560px] items-start gap-2 text-[13px] leading-5 text-[#6b7280]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        Dokumen kamu hanya dianalisis untuk review ini.
      </p>
      <p className="mt-2 max-w-[560px] text-[13px] leading-5 text-[#9aa0a8]">
        PDF maks {MAX_PDF_MB} MB — atau tarik &amp; lepas filenya ke mana saja di halaman ini.
      </p>
    </div>
  );
}

export function SkorHasil({ s }: { s: Skor }) {
  const { phase, fileName, ringkasan, ai, reset, review } = s;

  useEffect(() => {
    if (phase === "hasil") {
      document.getElementById("hasil-skor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  if (phase !== "hasil") return null;

  const aiById = new Map(ai.map((p) => [p.id, p]));
  const score = review?.score ?? 0;

  return (
    <div id="hasil-skor" className="scroll-mt-24">
      <p className="mb-3 truncate text-sm text-zinc-500">Hasil untuk {fileName}</p>
      <ScoreCard score={score} verdict={ringkasan || verdictFor(score)} />
      {review && <ReviewDetails review={review} />}

      <div className="mt-6 hidden overflow-hidden border border-[#dadada] bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Hasil penilaian 10 kriteria ATS</caption>
          <thead>
            <tr className="text-sm font-bold text-[#2c2c2c]">
              <th scope="col" className="w-[40%] bg-[#f8f8f8] px-7 py-5">
                Kriteria
              </th>
              <th scope="col" className="w-[20%] border-l border-[#dadada] px-7 py-5 text-center">
                Status
              </th>
              <th scope="col" className="w-[40%] border-l border-[#dadada] px-7 py-5">
                Catatan AI
              </th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((item) => (
              <tr key={item.id} className="border-t border-[#dadada] align-middle">
                <th scope="row" className="bg-[#f8f8f8] px-7 py-6 font-normal align-middle">
                  <span className="block text-base font-bold leading-snug text-[#2c2c2c]">
                    {item.t}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-black/70">
                    {item.d}
                  </span>
                </th>
                <td className="border-l border-[#dadada] px-7 py-6 text-center align-middle">
                  <StatusIcon status={aiById.get(item.id)?.status ?? "ragu"} label={item.t} />
                </td>
                <td className="border-l border-[#dadada] px-7 py-6 align-middle text-[0.9375rem] leading-6 text-black/70">
                  <PointDetail point={aiById.get(item.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 lg:hidden">
        {ITEMS.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dadada] bg-white">
            <div className="bg-[#f8f8f8] px-5 py-5">
              <h4 className="text-lg font-bold leading-snug">{item.t}</h4>
              <p className="mt-1 text-sm text-black/70">{item.d}</p>
            </div>
            <dl className="divide-y divide-[#dadada] border-t border-[#dadada]">
              <div className="flex items-center justify-between gap-5 px-5 py-4">
                <dt className="text-sm font-bold text-[#2c2c2c]">Status</dt>
                <dd><StatusIcon status={aiById.get(item.id)?.status ?? "ragu"} label={item.t} /></dd>
              </div>
              <div className="px-5 py-4">
                <dt className="text-sm font-bold text-[#2c2c2c]">Catatan AI</dt>
                <dd className="mt-1 text-sm leading-6 text-black/70"><PointDetail point={aiById.get(item.id)} /></dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <button type="button" onClick={reset} className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">
        <RotateCcw className="h-4 w-4" /> Nilai PDF lain
      </button>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Shell disalin dari FullscreenDetailSheet jds: fullscreen, overlay blur, header X transparan.
export function SkorConfirmModal({ s }: { s: Skor }) {
  return (
    <AnimatePresence>
      {s.confirmFile && <SkorConfirmModalContent key="cv-confirm" s={s} confirmFile={s.confirmFile} />}
    </AnimatePresence>
  );
}

function SkorConfirmModalContent({ s, confirmFile }: { s: Skor; confirmFile: File }) {
  const { dismissConfirm, confirm, replaceDoc } = s;
  const isPresent = useIsPresent();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissConfirm();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [confirmFile, dismissConfirm]);

  return (
    <motion.div className="fixed inset-0 z-[100] text-[#202124]" role="dialog" aria-modal="true" aria-label="Konfirmasi dokumen"
      initial="closed" animate="open" exit="closed" style={{ pointerEvents: isPresent ? "auto" : "none" }}>
      <motion.div
        className="absolute inset-0 bg-black/40 supports-backdrop-filter:backdrop-blur-[15px]"
        variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={dismissConfirm}
        aria-hidden="true"
      />
      <motion.div className="absolute inset-x-0 bottom-0 top-0 flex flex-col"
        variants={{ closed: { y: 150, opacity: 0 }, open: { y: 0, opacity: 1 } }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
        <header className="flex h-12 shrink-0 items-center justify-between px-3 sm:h-14 sm:px-5">
          <div className="min-w-24" />
          <button
            type="button"
            onClick={dismissConfirm}
            disabled={s.busy}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white/20 text-black transition-colors hover:bg-white/30"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="h-0.5 shrink-0 bg-white" />
        <div className="h-2.5 shrink-0 bg-zinc-200" />

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="grid min-h-full lg:h-full lg:grid-cols-[1.15fr_1fr]">
            <div className="min-w-0 bg-zinc-100 p-4 sm:p-6">
              {s.replacing ? <ModalCvUpload s={s} /> : <PdfPreview file={confirmFile} />}
            </div>
            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 lg:px-12">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">{s.replacing ? "Ganti CV" : s.busy ? "Sebentar…" : "Lanjut?"}</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-zinc-600">
                Pastikan dokumen di samping sudah benar. Kami akan membaca isinya seperti sistem ATS,
                lalu memberi skor dan saran perbaikan.
              </p>
              {!s.replacing && <div className="mt-6 flex max-w-md items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold text-zinc-900">{confirmFile.name}</span>
                  <span className="mt-0.5 block text-[13px] text-zinc-500">{formatSize(confirmFile.size)} · PDF</span>
                </span>
              </div>}
              <div className="mt-6 max-w-md">
      <label htmlFor="lowongan-skor" className="mb-2 block text-sm font-bold">Deskripsi lowongan (opsional)</label>
      <textarea id="lowongan-skor" value={s.jobDescription} onChange={e => s.setJobDescription(e.target.value)} maxLength={15000} disabled={s.busy} rows={4} placeholder="Tempel persyaratan dan tanggung jawab posisi tujuan." className="mb-2 w-full rounded-xl border border-zinc-300 bg-white p-4 text-sm" />
      <p className="mb-4 max-w-[560px] text-xs text-zinc-500">Tanpa lowongan, kecocokan tidak dinilai dan tidak mengurangi skor. Setelah login, review berjalan di dashboard Review CV. Teks CV dan lowongan dikirim ke Google Gemini saat review.</p>
              </div>
              {s.busy && <div role="status" aria-live="polite" className="mt-4 flex max-w-md items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                <Loader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin" />
                <span>{s.status}{s.phase === "nilai" && <span className="mt-1 block text-xs">{s.elapsed} detik</span>}</span>
              </div>}
              {s.error && <p role="alert" className="mt-4 max-w-md text-sm text-red-700">{s.error}</p>}
              <div className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  autoFocus
                  onClick={confirm}
                  disabled={s.busy || s.replacing || !s.staged}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-[#1c64f2] px-6 text-base font-bold text-white transition-colors hover:bg-[#1a56db] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {s.busy ? <><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> Memproses…</> : "Review CV"}
                </button>
                <button
                  type="button"
                  onClick={replaceDoc}
                  disabled={s.busy || s.replacing}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border-2 border-zinc-900 px-6 text-base font-bold text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Ganti dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalCvUpload({ s }: { s: Skor }) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="flex h-[50vh] items-center justify-center lg:h-[calc(100svh-7rem)]">
    <input ref={input} type="file" accept="application/pdf" className="sr-only" aria-label="Pilih CV PDF pengganti"
      onChange={e => { const file = e.target.files?.[0]; if (file) s.stage(file); e.target.value = ""; }} />
    <button type="button" onClick={() => input.current?.click()}
      className="flex w-full max-w-[560px] flex-col items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-center transition-colors hover:border-zinc-900">
      <FileUp aria-hidden="true" className="h-10 w-10 text-zinc-900" />
      <span className="mt-4 text-lg font-bold text-zinc-900">Upload CV PDF-mu</span>
      <span className="mt-1 max-w-sm text-sm text-zinc-600">Klik untuk pilih file atau seret PDF ke sini (maks {MAX_PDF_MB}MB).</span>
    </button>
  </div>;
}

export function ScoreCard({ score, verdict }: { score: number; verdict: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-600">Skor kualitas CV</p>
          <p className="text-5xl font-black tracking-tight text-zinc-900 sm:text-6xl" role="status">
            {score}
            <span className="text-2xl text-zinc-400">/100</span>
          </p>
        </div>
        <p className="max-w-sm text-sm text-zinc-600">{verdict}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
        <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StatusIcon({ status, label }: { status: "ya" | "tidak" | "ragu"; label: string }) {
  if (status === "ya")
    return (
      <span className="inline-flex items-center justify-center">
        <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
        <span className="sr-only">{label}: terisi</span>
      </span>
    );
  if (status === "tidak")
    return (
      <span className="inline-flex items-center justify-center">
        <Minus aria-hidden="true" className="h-5 w-5 text-black/30" strokeWidth={2.5} />
        <span className="sr-only">{label}: belum terisi</span>
      </span>
    );
  return <span className="text-sm font-semibold text-black/55">Ragu</span>;
}

function PointDetail({ point }: { point?: Point }) {
  if (!point) return <>Tidak dapat dinilai</>;
  return <div className="space-y-2"><p className="font-bold">{point.nilai === null ? "Tidak dinilai" : point.nilai + "/100"}</p><p>{point.catatan}</p>{point.bukti && <blockquote className="border-l-2 border-blue-300 pl-3 text-sm italic">{point.bukti}</blockquote>}<p className="text-sm"><strong>Saran: </strong>{point.saran}</p></div>;
}
function ReviewDetails({ review: r }: { review: Review }) {
  return <div className="mt-6 space-y-6">
    <p className="text-xs text-zinc-500">Review AI · {r.model} · Skor berbobot dari kriteria yang dapat dinilai. Bukan jaminan lolos ATS atau rekrutmen.</p>
    <section><h3 className="text-xl font-bold">Kekuatan CV</h3><ul className="mt-3 list-disc space-y-2 pl-5">{r.kekuatan.map((v,i) => <li key={i}>{v}</li>)}</ul></section>
    <section><h3 className="text-xl font-bold">Prioritas perbaikan</h3><ol className="mt-3 space-y-3">{r.prioritas.map((p,i) => <li key={i} className="rounded-xl bg-zinc-50 p-5"><h4 className="font-bold">{i+1}. {p.masalah}</h4><p className="mt-2 text-sm">{p.tindakan}</p><p className="mt-2 text-sm text-zinc-500">{p.dampak}</p></li>)}</ol></section>
    {(r.kecocokan.terpenuhi.length > 0 || r.kecocokan.belumTerbukti.length > 0) && <section><h3 className="text-xl font-bold">Kecocokan lowongan</h3><h4 className="mt-3 font-bold">Didukung CV</h4><ul className="list-disc pl-5">{r.kecocokan.terpenuhi.map((v,i) => <li key={i}>{v}</li>)}</ul><h4 className="mt-3 font-bold">Belum terbukti di CV</h4><ul className="list-disc pl-5">{r.kecocokan.belumTerbukti.map((v,i) => <li key={i}>{v}</li>)}</ul></section>}
    {r.revisi.length > 0 && <section><h3 className="text-xl font-bold">Contoh revisi berdasarkan fakta CV</h3><div className="mt-3 space-y-3">{r.revisi.map((v,i) => <article key={i} className="rounded-xl border p-5"><p className="text-xs font-bold text-zinc-500">SEBELUM</p><p className="mt-1 text-sm">{v.sebelum}</p><p className="mt-4 text-xs font-bold text-blue-700">SARAN REVISI</p><p className="mt-1 text-sm">{v.sesudah}</p><p className="mt-3 text-xs text-zinc-500">{v.alasan}</p></article>)}</div></section>}
    <section className="rounded-xl bg-amber-50 p-4 text-sm"><h3 className="font-bold">Batasan analisis</h3><ul className="mt-2 list-disc space-y-1 pl-5"><li>Analisis berbasis teks; font dan desain visual tidak diverifikasi.</li>{r.batasan.map((v,i) => <li key={i}>{v}</li>)}</ul></section>
  </div>;
}
