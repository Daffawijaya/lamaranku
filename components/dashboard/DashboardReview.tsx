"use client";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { SkorHasil, useSkor } from "../SkorChecker";
import { CheckCircle2 } from "lucide-react";
import { CvReviewProgress } from "./CvReviewProgress";
import { DashboardReviewInput } from "./DashboardReviewInput";
import { AiCvRepair } from "./AiCvRepair";
export function DashboardReview() {
  const s = useSkor(true);
  return (
    <div className={!s.staged && !s.busy && s.phase !== "hasil" ? "dash-content-narrow" : undefined}>
      <div className={`dash-feature-panel dashboard-review-panel${s.phase === "hasil" ? " is-results" : s.busy ? " is-processing" : ""}`}>
        {s.busy && <CvReviewProgress s={s} />}
        {!s.busy && s.phase !== "hasil" && <DashboardReviewInput s={s} />}
        {s.phase === "hasil" && (
          <p className="cv-review-success" role="status">
            <CheckCircle2 size={17} aria-hidden="true" />
            <T text={"Review selesai"} /><span>100%</span>
          </p>
        )}
        {s.phase === "hasil" && <SkorHasil s={s}>
          {s.review && <AiCvRepair key={s.fileName} file={s.staged} review={s.review} />}
        </SkorHasil>}
      </div>
    </div>
  );
}
