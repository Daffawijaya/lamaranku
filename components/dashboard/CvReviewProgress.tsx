"use client";

import {
  Check,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Skor } from "../SkorChecker";
import { reviewProgress } from "../../lib/review-progress";
import "./review-progress.css";

const STEPS = [
  {
    title: "Memeriksa sesi",
    description: "Memastikan akun sudah masuk sebelum review dimulai.",
  },
  {
    title: "Membaca dokumen",
    description: "Mengambil teks dari setiap halaman PDF di perangkatmu.",
  },
  {
    title: "Menganalisis dengan AI",
    description: "Menelaah isi CV, bukti pengalaman, dan prioritas perbaikan.",
  },
  {
    title: "Menyiapkan hasil review",
    description: "Memeriksa respons dan menyiapkan skor beserta rekomendasi.",
  },
];

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CvReviewProgress({
  s,
}: {
  s: Pick<
    Skor,
    | "phase"
    | "elapsed"
    | "totalElapsed"
    | "readProgress"
    | "fileName"
    | "jobDescription"
  >;
}) {
  const progress = reviewProgress(
    s.phase,
    s.elapsed,
    s.readProgress.current,
    s.readProgress.total,
  );
  const slow = s.phase === "nilai" && s.elapsed >= 30;
  const active = STEPS[progress.step];
  const pageStatus = s.readProgress.total
    ? `${s.readProgress.current} dari ${s.readProgress.total} halaman terbaca`
    : "Membuka PDF dan menghitung halaman";
  return (
    <section
      className="cv-review-progress"
      aria-labelledby="review-progress-title"
    >
      <header className="cv-review-progress-header">
        <span className="cv-review-progress-symbol">
          <Sparkles size={25} aria-hidden="true" />
        </span>
        <div>
          <span className="cv-review-eyebrow">REVIEW CV DENGAN AI</span>
          <h2 id="review-progress-title">CV sedang ditinjau</h2>
          <p>Kami sedang menyiapkan masukan untuk CV-mu.</p>
        </div>
        <span className="cv-review-running">
          <span />
          Sedang diproses
        </span>
      </header>
      <div className="cv-review-file">
        <FileText size={19} aria-hidden="true" />
        <span title={s.fileName}>{s.fileName}</span>
        <small>PDF</small>
      </div>
      <div className="cv-review-overall">
        <div className="cv-review-overall-heading">
          <div>
            <strong>Progres keseluruhan</strong>
            <span>
              Tahap {progress.step + 1} dari {STEPS.length} · {active.title}
            </span>
          </div>
          <span className="cv-review-percentage">
            {progress.overall}
            <small>%</small>
          </span>
        </div>
        <div
          className="cv-review-progress-track"
          role="progressbar"
          aria-label="Estimasi progres keseluruhan review CV"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.overall}
          aria-valuetext={`${progress.overall}% estimasi, tahap ${progress.step + 1} dari ${STEPS.length}: ${active.title}`}
        >
          <span style={{ width: `${progress.overall}%` }} />
        </div>
        <p className="cv-review-estimate">
          Persentase keseluruhan adalah estimasi. Mencapai 100% setelah hasil
          review diterima.
        </p>
        <p className="cv-review-timing">
          <Clock3 size={13} aria-hidden="true" />
          Waktu berjalan <strong>{duration(s.totalElapsed)}</strong>
        </p>
      </div>
      <div className="cv-review-detail-grid">
        <ol className="cv-review-steps" aria-label="Tahapan review CV">
          {STEPS.map((step, index) => {
            const done = index < progress.step;
            const current = index === progress.step;
            return (
              <li
                key={step.title}
                className={
                  done ? "is-complete" : current ? "is-current" : "is-pending"
                }
                aria-current={current ? "step" : undefined}
              >
                <span className="cv-review-step-marker" aria-hidden="true">
                  {done ? (
                    <Check size={16} />
                  ) : current ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="cv-review-step-copy">
                  <strong>{step.title}</strong>
                  <p>
                    {current && index === 1 ? pageStatus : step.description}
                  </p>
                </div>
                <span className="cv-review-step-status">
                  {done ? (
                    <>
                      <span className="sr-only">Selesai · </span>100%
                    </>
                  ) : current ? (
                    index === 1 && s.readProgress.total ? (
                      `${progress.reading}%`
                    ) : index === 2 ? (
                      `~${progress.ai}%`
                    ) : (
                      "Berlangsung"
                    )
                  ) : (
                    "Menunggu"
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        <aside className="cv-review-current-detail">
          <span className="cv-review-detail-label">TAHAP AKTIF</span>
          <h3>{active.title}</h3>
          <p>{s.phase === "baca" ? pageStatus : active.description}</p>
          <div className="cv-review-clock">
            <Clock3 size={16} aria-hidden="true" />
            <span>Waktu berjalan</span>
            <strong>{duration(s.totalElapsed)}</strong>
          </div>
          <div className="cv-review-scope">
            <strong>Cakupan review</strong>
            <span>Struktur dan isi CV</span>
            <span>Bukti dan keahlian</span>
            <span>Saran perbaikan</span>
            {s.jobDescription.trim() && <span>Kecocokan lowongan</span>}
          </div>
          {s.phase === "nilai" && (
            <p className="cv-review-ai-estimate">
              ~{progress.ai}% adalah estimasi tahap AI. Progres langsung belum
              tersedia dari layanan AI.
            </p>
          )}
        </aside>
      </div>
      <footer
        className={"cv-review-progress-footer" + (slow ? " is-slow" : "")}
      >
        {slow ? (
          <Clock3 size={16} aria-hidden="true" />
        ) : (
          <ShieldCheck size={16} aria-hidden="true" />
        )}
        <p role="status" aria-live="polite">
          {slow
            ? "Respons AI lebih lama dari biasanya. Analisis masih menunggu hasil; halaman akan diperbarui otomatis."
            : "Hasil akan tampil otomatis setelah selesai. Tetap di halaman ini selama review berlangsung."}
        </p>
      </footer>
    </section>
  );
}
