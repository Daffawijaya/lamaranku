"use client";
import { SkorHasil } from "../SkorChecker";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { CheckCircle2 } from "lucide-react";
import { CvReviewProgress } from "./CvReviewProgress";
import { DashboardReviewInput } from "./DashboardReviewInput";
import { useDashboardReview } from "./ReviewContext";
import { motion, useReducedMotion } from "framer-motion";
export function DashboardReview({ step = "input" }: { step?: "input" | "proses" | "hasil" }) {
  const s = useDashboardReview();
  const reducedMotion = useReducedMotion();
  if ((step === "input" && (s.busy || s.phase === "hasil")) ||
      (step === "proses" && !s.busy) || (step === "hasil" && s.phase !== "hasil")) return null;
  return (
    <div className={!s.staged && !s.busy && s.phase !== "hasil" ? "dash-content-narrow" : undefined}>
      <motion.div layout="position" transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <DashboardPageHeader
        title="Kenali kekuatan CV-mu."
        description="Evaluasi berbukti, kecocokan lowongan, dan langkah perbaikan yang konkret."
      />
      </motion.div>
      <div className="dash-feature-panel">
        {step === "proses" && <CvReviewProgress s={s} />}
        {step === "input" && <DashboardReviewInput s={s} />}
        {step === "hasil" && (
          <p className="cv-review-success" role="status">
            <CheckCircle2 size={17} aria-hidden="true" />
            Review selesai<span>100%</span>
          </p>
        )}
        {step === "hasil" && s.review?.usedFallback && (
          <p className="mb-5 text-xs leading-5 text-zinc-500">
            Review menggunakan model AI cadangan yang lebih ringan karena model
            utama sedang sibuk. Seluruh kriteria review tetap diperiksa.
          </p>
        )}
        {step === "hasil" && <SkorHasil s={s} />}
      </div>
    </div>
  );
}
