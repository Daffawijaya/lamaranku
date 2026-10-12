"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, FileUp, Gauge, Loader2, Minus, RotateCcw, ShieldCheck } from "lucide-react";

const MAX_PDF_MB = 5;
const MAX_READ_PAGES = 5;

const ITEMS = [
  { id: "kontak", t: "Kontak lengkap", d: "Email dan nomor HP aktif tertulis di atas." },
  { id: "kolom", t: "Satu kolom", d: "Tanpa tabel, kolom ganda, grafik, atau header aneh." },
  { id: "font", t: "Font standar", d: "Arial, Calibri, Georgia, atau Times. Bukan dekoratif." },
  { id: "judul", t: "Judul bagian jelas", d: "Ada Pengalaman, Pendidikan, dan Keahlian." },
  { id: "angka", t: "Angka hasil", d: "Pengalaman menyebut angka: jumlah, persen, atau waktu." },
  { id: "keyword", t: "Keyword lowongan", d: "Skill di CV sama dengan kata di lowongan yang dituju." },
  { id: "bahasa", t: "Satu bahasa", d: "Full Indonesia atau full Inggris, tidak campur." },
  { id: "halaman", t: "Maksimal 2 halaman", d: "Fresh graduate cukup 1 halaman." },
  { id: "format", t: "Format PDF", d: "Bukan foto, bukan doc yang berantakan." },
  { id: "skill", t: "Skill spesifik", d: "Tertulis skill teknis, bukan cuma kerja keras dan jujur." },
];

type AiPoint = { id: string; status: "ya" | "tidak" | "ragu"; catatan: string };
type Phase = "awal" | "siap" | "baca" | "nilai" | "hasil" | "gagal";

function isAiPoint(value: unknown): value is AiPoint {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && (v.status === "ya" || v.status === "tidak" || v.status === "ragu") && typeof v.catatan === "string";
}

// PDF dibaca lokal di HP (maks 5 halaman teks); file tidak diunggah ke mana pun.
async function extractPdf(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  const pdfTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const pdf = await pdfTask.promise;
  try {
    const n = Math.min(pdf.numPages, MAX_READ_PAGES);
    let text = "";
    for (let i = 1; i <= n; i++) {
      const page = await pdf.getPage(i);
      try {
        const content = await page.getTextContent();
        text += content.items.map((it) => (it as { str?: string }).str ?? "").join(" ") + "\n";
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

export function useSkor() {
  const [phase, setPhase] = useState<Phase>("awal");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [ai, setAi] = useState<AiPoint[]>([]);
  const [staged, setStaged] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Dipilih/diseret dulu, dinilai setelah tekan "Cek Skor".
  const stage = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("File harus PDF.");
      setStaged(null);
      setAi([]);
      setPhase("gagal");
      return;
    }
    if (file.size === 0) {
      setError("PDF kosong atau rusak.");
      setStaged(null);
      setAi([]);
      setPhase("gagal");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`PDF maksimal ${MAX_PDF_MB}MB.`);
      setStaged(null);
      setAi([]);
      setPhase("gagal");
      return;
    }
    setError("");
    setAi([]);
    setStaged(file);
    setFileName(file.name);
    setPhase("siap");
  };

  const analyze = async (file: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestRef.current;
    const alive = () => requestRef.current === requestId && !controller.signal.aborted;

    setError("");
    setFileName(file.name);
    try {
      setPhase("baca");
      setStatus("Membaca PDF di HP-mu…");
      const { text, pages } = await extractPdf(file);
      if (!alive()) return;
      if (text.trim().length < 50) throw new Error("Teks tidak terbaca (mungkin hasil scan foto).");
      setPhase("nilai");
      setStatus("AI menilai 10 kriteria…");
      const res = await fetch("/api/skor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pages }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!alive()) return;
      if (!res.ok) throw new Error(data?.error ?? "Penilaian gagal.");
      if (!Array.isArray(data?.poin)) throw new Error("Jawaban AI tidak lengkap. Coba lagi.");
      const points = data.poin.filter(isAiPoint);
      if (points.length === 0) throw new Error("Jawaban AI tidak lengkap. Coba lagi.");
      setAi(points);
      setRingkasan(typeof data.ringkasan === "string" && data.ringkasan ? data.ringkasan : verdictFor(0));
      setPhase("hasil");
    } catch (e) {
      if (!alive()) return;
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Gagal menganalisis.");
      setPhase("gagal");
    }
  };

  const reset = () => {
    requestRef.current += 1;
    abortRef.current?.abort();
    setPhase("awal");
    setError("");
    setFileName("");
    setAi([]);
    setStaged(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const busy = phase === "baca" || phase === "nilai";
  busyRef.current = busy;

  return { phase, status, error, fileName, ringkasan, ai, staged, inputRef, busyRef, busy, stage, analyze, reset };
}

export type Skor = ReturnType<typeof useSkor>;

export function SkorUploadPill({ s }: { s: Skor }) {
  const { phase, status, error, fileName, staged, inputRef, busyRef, busy, stage, analyze } = s;

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
              ? `Klik untuk pilih file (maks ${MAX_PDF_MB}MB). PDF dibaca di HP-mu, hanya teks yang dikirim ke AI untuk dinilai.`
              : "Sebentar…"}
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
  const { phase, fileName, ringkasan, ai, reset } = s;

  useEffect(() => {
    if (phase === "hasil") {
      document.getElementById("hasil-skor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  if (phase !== "hasil") return null;

  const aiById = new Map(ai.map((p) => [p.id, p]));
  const done = ITEMS.filter((item) => aiById.get(item.id)?.status === "ya").length;
  const score = Math.round((done / ITEMS.length) * 100);

  return (
    <div id="hasil-skor" className="scroll-mt-24">
      <p className="mb-3 truncate text-sm text-zinc-500">Hasil untuk {fileName}</p>
      <ScoreCard score={score} verdict={ringkasan || verdictFor(score)} />

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
                  {aiById.get(item.id)?.catatan || "-"}
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
                <dd className="mt-1 text-sm leading-6 text-black/70">{aiById.get(item.id)?.catatan || "-"}</dd>
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

export function ScoreCard({ score, verdict }: { score: number; verdict: string }) {
  return (
    <div className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-600">Skor kesiapan ATS</p>
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
