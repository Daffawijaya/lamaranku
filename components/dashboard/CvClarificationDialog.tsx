"use client";
import { useState } from "react";
import type { CvAnswer, CvQuestion } from "../../lib/cv-clarifications";
import { ConfirmModal } from "../ui/ConfirmModal";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import "./cv-clarification.css";

export function CvClarificationDialog({ questions, onComplete, onClose }: {
  questions: CvQuestion[]; onComplete: (answers: CvAnswer[]) => void; onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const current = questions[index];
  const answer = drafts[current.id] ?? "";
  const last = index === questions.length - 1;
  function advance(skip: boolean) {
    const next = { ...drafts, [current.id]: skip ? "" : answer };
    setDrafts(next);
    if (!last) { setIndex(index + 1); return; }
    onComplete(questions.flatMap(question => next[question.id]?.trim() ? [{ ...question, answer: next[question.id].trim() }] : []));
  }
  return <ConfirmModal title="Lengkapi CV-mu" className="cv-clarification-modal" confirmLabel={last ? "Perbaiki CV" : "Selanjutnya"}
    onClose={onClose} onConfirm={() => advance(false)} cancelLabel="Tidak tahu / Lewati" onCancelAction={() => advance(true)}
    footerStart={<span className="cv-clarification-back">{index > 0 && <button type="button" className="help-modal-button help-modal-button-ghost" onClick={() => setIndex(index - 1)}><T text="Kembali" /></button>}</span>}>
    <div className="cv-clarification-progress"><span><T text="Pertanyaan {0} dari {1}" values={[index + 1, questions.length]} /></span>
      <span className="cv-clarification-steps" aria-hidden="true">{questions.map((q, i) => <i key={q.id} data-active={i <= index ? "true" : undefined} />)}</span>
    </div>
    <label htmlFor="cv-clarification-answer"><T text={current.question} /></label>
    <LocalizedAttributes><textarea id="cv-clarification-answer" rows={4} maxLength={1000}
      value={answer} onChange={event => setDrafts({ ...drafts, [current.id]: event.target.value })}
      placeholder="Tulis fakta yang kamu ketahui." /></LocalizedAttributes>
    <p className="help-modal-caption"><T text="Jawab sesuai yang kamu tahu. Boleh dilewati." /></p>
  </ConfirmModal>;
}
