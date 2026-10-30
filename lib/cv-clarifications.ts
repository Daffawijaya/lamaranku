export type CvQuestion = { id: string; segmentId: string; question: string };
export type CvAnswer = CvQuestion & { answer: string };

export function validateCvQuestions(value: unknown, editableIds: string[]): CvQuestion[] {
  if (!Array.isArray(value) || value.length > 6) throw new Error("Pertanyaan AI belum valid. Coba lagi.");
  const seen = new Set<string>();
  return value.map(item => {
    if (!item || typeof item.id !== "string" || !/^[\w-]{1,50}$/.test(item.id) || seen.has(item.id)
      || !editableIds.includes(item.segmentId) || typeof item.question !== "string" || !item.question.trim() || item.question.length > 600) throw new Error("Pertanyaan AI tidak sesuai bagian CV.");
    seen.add(item.id);
    return { id: item.id, segmentId: item.segmentId, question: item.question.trim() };
  });
}
export function validateCvAnswers(value: unknown, editableIds: string[]): CvAnswer[] {
  if (!Array.isArray(value)) throw new Error("Jawaban klarifikasi tidak valid.");
  const questions = validateCvQuestions(value, editableIds);
  return questions.flatMap((question, index) => {
    const answer = value[index].answer;
    if (typeof answer !== "string" || answer.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(answer)) throw new Error("Jawaban maksimal 1.000 karakter per pertanyaan.");
    return answer.trim() ? [{ ...question, answer: answer.trim() }] : [];
  });
}

const facts = (text: string) => text.match(/\d+(?:[.,:/-]\d+)*(?:\s?%)?|\S+@\S+|https?:\/\/\S+/g) ?? [];
/** Original facts must remain in order. Extra facts must be explicitly supplied for this paragraph. */
export function preservesConfirmedFacts(before: string, after: string, answers: string[] = []) {
  const original = facts(before);
  const allowed = new Map<string, number>();
  for (const fact of facts(answers.join(" "))) allowed.set(fact, (allowed.get(fact) ?? 0) + 1);
  let index = 0;
  for (const fact of facts(after)) {
    if (fact === original[index]) { index++; continue; }
    const count = allowed.get(fact) ?? 0;
    if (!count) return false;
    allowed.set(fact, count - 1);
  }
  return index === original.length;
}
