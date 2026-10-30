"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { ScanText } from "lucide-react";
import { SkorUploadPill, type Skor } from "../SkorChecker";
import { PdfPreview } from "../skor/PdfPreview";
import { motion, useReducedMotion } from "framer-motion";

export function DashboardReviewInput({ s }: { s: Skor }) {
  const reducedMotion = useReducedMotion();
  const transition = { duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] as const };
  return (
    <motion.div
      layout="position"
      transition={transition}
      className={
        s.staged ? "grid items-start gap-7 xl:grid-cols-2" : "dash-content-narrow"
      }
    >
      {s.staged && (
        <LocalizedAttributes key="pdf-preview"><motion.section
          key="pdf-preview"
          initial={reducedMotion ? false : { opacity: 0, x: -24, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={transition}
          className="dashboard-review-preview min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
          aria-label="Dokumen CV"
        >
          <div className="border-b border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-600">
            <T text={"Pratinjau CV "} /></div>
          <div className="p-3">
            <PdfPreview file={s.staged} />
          </div>
        </motion.section></LocalizedAttributes>
      )}
      <motion.div key="review-form" layout="position" transition={transition} className="dash-ui-card min-w-0">
        <SkorUploadPill s={s} showAction={false} />
        <div className="mt-6">
          <label
            htmlFor="dashboard-review-job"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            <T text={"Deskripsi lowongan"} />{" "}
            <span className="font-normal text-zinc-400"><T text={"(opsional)"} /></span>
          </label>
          <LocalizedAttributes><textarea
            id="dashboard-review-job"
            value={s.jobDescription}
            onChange={(event) => s.setJobDescription(event.target.value)}
            maxLength={15000}
            rows={5}
            placeholder="Tempel persyaratan dan tanggung jawab posisi tujuan."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-700 placeholder:text-zinc-400"
          /></LocalizedAttributes>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            <T text={"Tanpa lowongan, kecocokan posisi tidak dinilai dan tidak mengurangi skor. Teks CV dan lowongan dikirim ke Google Gemini saat review. "} /></p>
        </div>
        <button
          type="button"
          disabled={!s.staged || s.busy}
          onClick={() => s.staged && void s.analyze(s.staged)}
          className="dash-ui-button dash-ui-button-primary mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--appearance-accent,#3b63fb)] px-6 py-3 text-sm font-bold text-[color:var(--appearance-on-accent,#fff)] transition-colors hover:bg-[var(--dash-blue-hover,#274dea)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ScanText size={18} aria-hidden="true" />
          <T text={s.phase === "gagal" && s.staged ? "Coba review lagi" : "Review CV"} />
        </button>
      </motion.div>
    </motion.div>
  );
}
