export type CvRevisionProposal = { id: string; before: string; after: string };
/** Bind each explicit choice to the original paragraph; reject stale or duplicate proposals. */
export function validateApprovedRevisions(value: unknown, originals: { id: string; text: string }[]): CvRevisionProposal[] {
  if (!Array.isArray(value) || value.length > originals.length) throw new Error("Pilihan revisi tidak valid.");
  const seen = new Set<string>();
  return value.map(item => {
    const original = originals.find(segment => segment.id === item?.id);
    if (!original || seen.has(item.id) || item.before !== original.text || typeof item.after !== "string"
      || !item.after.trim() || item.after.length > 2000 || /[\u0000-\u001f\u007f]/.test(item.after)) throw new Error("Pilihan revisi tidak sesuai dokumen asli. Siapkan usulan lagi.");
    seen.add(item.id);
    return { id: item.id, before: original.text, after: item.after.trim() };
  });
}
