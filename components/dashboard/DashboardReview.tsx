"use client";
import { SkorUploadPill, SkorConfirmModal, SkorHasil, useSkor } from "../SkorChecker";
export function DashboardReview() {
  const s = useSkor(true);
  return <div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Review CV dengan AI</p><h1 className="mt-3 text-3xl font-bold tracking-tight">Kenali kekuatan CV-mu.</h1><p className="mb-8 mt-3 text-sm leading-6 text-zinc-500">Evaluasi berbukti, kecocokan lowongan, dan langkah perbaikan yang konkret.</p>{s.phase !== "hasil" && <SkorUploadPill s={s} />}<SkorHasil s={s} /><SkorConfirmModal s={s} /></div>;
}
