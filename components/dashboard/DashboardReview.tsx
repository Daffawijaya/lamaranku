"use client";
import { SkorHasil, useSkor } from "../SkorChecker";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { CheckCircle2 } from "lucide-react";
import { CvReviewProgress } from "./CvReviewProgress";
import { DashboardReviewInput } from "./DashboardReviewInput";
export function DashboardReview() {
  const s = useSkor(true);
  return (
    <div>
      <DashboardPageHeader
        title="Kenali kekuatan CV-mu."
        description="Evaluasi berbukti, kecocokan lowongan, dan langkah perbaikan yang konkret."
      />
      <div className="dash-feature-panel">
        {s.busy ? (
          <CvReviewProgress s={s} />
        ) : (
          s.phase !== "hasil" && <DashboardReviewInput s={s} />
        )}
        {s.phase === "hasil" && (
          <p className="cv-review-success" role="status">
            <CheckCircle2 size={17} aria-hidden="true" />
            Review selesai<span>100%</span>
          </p>
        )}
        {s.phase === "hasil" && s.review?.usedFallback && (
          <p className="mb-5 text-xs leading-5 text-zinc-500">
            Review menggunakan model AI cadangan yang lebih ringan karena model
            utama sedang sibuk. Seluruh kriteria review tetap diperiksa.
          </p>
        )}
        <SkorHasil s={s} />
      </div>
    </div>
  );
}
