"use client";
import {
  SkorUploadPill,
  SkorConfirmModal,
  SkorHasil,
  useSkor,
} from "../SkorChecker";
import { DashboardPageHeader } from "./DashboardPageHeader";
export function DashboardReview() {
  const s = useSkor(true);
  return (
    <div className="w-full">
      <DashboardPageHeader
        eyebrow="REVIEW CV DENGAN AI"
        title="Kenali kekuatan CV-mu."
        description="Evaluasi berbukti, kecocokan lowongan, dan langkah perbaikan yang konkret."
      />
      <div className="workspace-feature-panel">
        {s.phase !== "hasil" && <SkorUploadPill s={s} />}
        <SkorHasil s={s} />
      </div>
      <SkorConfirmModal s={s} />
    </div>
  );
}
