/** Require an explicit decision for every paragraph, including unchanged text. */
export function validateCvEditCoverage(value: unknown, ids: string[]): { id: string; text: string }[] {
  if (!Array.isArray(value) || value.length !== ids.length) throw new Error("AI belum meninjau seluruh kalimat. Silakan coba lagi.");
  const remaining = new Set(ids);
  for (const revision of value) {
    if (!revision || typeof revision.id !== "string" || typeof revision.text !== "string" || !remaining.delete(revision.id)) throw new Error("Jawaban AI tidak sesuai paragraf yang ditinjau.");
  }
  if (remaining.size) throw new Error("AI belum meninjau seluruh kalimat. Silakan coba lagi.");
  return value;
}
