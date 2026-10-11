"use client";

import { useRef, useState } from "react";
import { Check, FileUp, Loader2, RotateCcw } from "lucide-react";

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
type Phase = "awal" | "baca" | "nilai" | "hasil" | "gagal" | "manual";

// PDF dibaca lokal di HP (maks 5 halaman teks); file tidak diunggah ke mana pun.
async function extractPdf(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const n = Math.min(pdf.numPages, 5);
  let text = "";
  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => (it as { str?: string }).str ?? "").join(" ") + "\n";
  }
  const pages = pdf.numPages;
  return { text, pages };
}

function verdictFor(score: number): string {
  if (score < 50) return "Perlu banyak perbaikan sebelum dikirim.";
  if (score < 80) return "Cukup. Poles bagian yang belum terisi.";
  return "Siap kirim. Tinggal sesuaikan keyword per lowongan.";
}

export function SkorChecker() {
  const [phase, setPhase] = useState<Phase>("awal");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [ai, setAi] = useState<AiPoint[]>([]);
  const [checked, setChecked] = useState<boolean[]>(() => ITEMS.map(() => false));
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("File harus PDF.");
      setPhase("gagal");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("PDF maksimal 5MB.");
      setPhase("gagal");
      return;
    }
    setError("");
    setFileName(file.name);
    try {
      setPhase("baca");
      setStatus("Membaca PDF di HP-mu…");
      const { text, pages } = await extractPdf(file);
      if (text.trim().length < 50) throw new Error("Teks tidak terbaca (mungkin hasil scan foto).");
      setPhase("nilai");
      setStatus("AI menilai 10 kriteria…");
      const res = await fetch("/api/skor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pages }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Penilaian gagal.");
      const points: AiPoint[] = data.poin;
      setAi(points);
      setChecked(ITEMS.map((item) => points.find((p) => p.id === item.id)?.status === "ya"));
      setRingkasan(data.ringkasan || verdictFor(0));
      setPhase("hasil");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menganalisis.");
      setPhase("gagal");
    }
  };

  const reset = () => {
    setPhase("awal");
    setError("");
    setFileName("");
    setAi([]);
    setChecked(ITEMS.map(() => false));
    if (inputRef.current) inputRef.current.value = "";
  };

  const done = checked.filter(Boolean).length;
  const score = Math.round((done / ITEMS.length) * 100);
  const aiById = new Map(ai.map((p) => [p.id, p]));

  if (phase === "manual") {
    return (
      <div>
        <ScoreCard score={score} verdict={verdictFor(score)} />
        <ul className="mt-4 space-y-3">
          {ITEMS.map((item, i) => (
            <CheckRow key={item.id} title={item.t} desc={item.d} on={checked[i]} onToggle={() => setChecked((c) => c.map((v, x) => (x === i ? !v : v)))} />
          ))}
        </ul>
        <button onClick={reset} className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">
          <RotateCcw className="h-4 w-4" /> Kembali ke upload PDF
        </button>
      </div>
    );
  }

  if (phase === "hasil") {
    return (
      <div>
        <p className="mb-3 truncate text-sm text-zinc-500">Hasil untuk {fileName}</p>
        <ScoreCard score={score} verdict={ringkasan || verdictFor(score)} />
        <ul className="mt-4 space-y-3">
          {ITEMS.map((item, i) => {
            const p = aiById.get(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={checked[i]}
                  onClick={() => setChecked((c) => c.map((v, x) => (x === i ? !v : v)))}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    checked[i] ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      checked[i] ? "border-white bg-white text-black" : "border-zinc-300 text-transparent"
                    }`}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-bold">
                      {item.t}
                      <StatusPill status={p?.status ?? "ragu"} />
                    </span>
                    <span className={`mt-0.5 block text-sm ${checked[i] ? "text-white/70" : "text-zinc-600"}`}>
                      {p?.catatan || item.d}
                    </span>
                    <span className={`mt-1 block text-xs ${checked[i] ? "text-white/50" : "text-zinc-400"}`}>
                      Ketuk untuk ubah manual.
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button onClick={reset} className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">
          <RotateCcw className="h-4 w-4" /> Nilai PDF lain
        </button>
      </div>
    );
  }

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
          if (f) void analyze(f);
        }}
      />
      <button
        type="button"
        disabled={phase === "baca" || phase === "nilai"}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center transition-colors hover:border-zinc-900 disabled:opacity-70"
      >
        {(phase === "baca" || phase === "nilai") ? (
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
        ) : (
          <FileUp className="h-10 w-10 text-zinc-900" />
        )}
        <span className="mt-4 text-lg font-bold text-zinc-900">
          {phase === "awal" ? "Upload CV PDF-mu" : status}
        </span>
        <span className="mt-1 max-w-sm text-sm text-zinc-600">
          {phase === "awal"
            ? "Klik untuk pilih file (maks 5MB). PDF dibaca di HP-mu, hanya teks yang dikirim ke AI untuk dinilai."
            : "Sebentar…"}
        </span>
      </button>

      {phase === "gagal" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
          <p className="font-bold text-red-900">Gagal menilai.</p>
          <p className="mt-1 text-sm text-red-800">{error}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={reset} className="inline-flex min-h-[44px] items-center rounded-full bg-zinc-900 px-6 text-sm font-bold text-white transition-colors hover:bg-black">
              Coba lagi
            </button>
            <button onClick={() => { setError(""); setPhase("manual"); }} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#2c2c2c] px-6 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">
              Cek manual saja
            </button>
          </div>
        </div>
      )}

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

function StatusPill({ status }: { status: "ya" | "tidak" | "ragu" }) {
  if (status === "ya") return <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">Terisi</span>;
  if (status === "tidak") return <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-300">Belum</span>;
  return <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold text-current opacity-70">Cek manual</span>;
}

function CheckRow({ title, desc, on, onToggle }: { title: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={on}
        onClick={onToggle}
        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
          on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
        }`}
      >
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            on ? "border-white bg-white text-black" : "border-zinc-300 text-transparent"
          }`}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <span>
          <span className="block font-bold">{title}</span>
          <span className={`mt-0.5 block text-sm ${on ? "text-white/70" : "text-zinc-600"}`}>{desc}</span>
        </span>
      </button>
    </li>
  );
}
