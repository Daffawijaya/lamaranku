"use client";
import { SkorHasil, useSkor } from "../SkorChecker";
import { CheckCircle2 } from "lucide-react";
import { CvReviewProgress } from "./CvReviewProgress";
import { DashboardReviewInput } from "./DashboardReviewInput";
export function DashboardReview() {
  const s = useSkor(true);
  return (
    <div className={!s.staged && !s.busy && s.phase !== "hasil" ? "dash-content-narrow" : undefined}>
      <div className="dash-feature-panel">
        {s.busy && <CvReviewProgress s={s} />}
        {!s.busy && s.phase !== "hasil" && <DashboardReviewInput s={s} />}
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
        {s.phase === "hasil" && <SkorHasil s={s} />}
      </div>
    </div>
  );
}
