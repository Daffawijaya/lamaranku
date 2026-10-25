export type CvExcerpt = { id: string; text: string };
export const CV_EVIDENCE_SEPARATOR = "\n[…]\n";

// Each excerpt is a contiguous slice of the extracted PDF, never generated text.
export function cvExcerpts(text: string): CvExcerpt[] {
  const excerpts: CvExcerpt[] = [];
  for (const line of text.split(/\r?\n/)) {
    let remaining = line.trim();
    while (remaining) {
      const space = remaining.lastIndexOf(" ", 240);
      const end =
        remaining.length <= 240 ? remaining.length : space > 0 ? space : 240;
      excerpts.push({
        id: `CV${String(excerpts.length + 1).padStart(3, "0")}`,
        text: remaining.slice(0, end),
      });
      remaining = remaining.slice(end).trim();
    }
  }
  return excerpts;
}

export function resolveCvEvidence(
  value: unknown,
  excerpts: CvExcerpt[],
): unknown {
  if (!value || typeof value !== "object") return value;
  const review = value as Record<string, unknown>;
  const source = new Map(excerpts.map((excerpt) => [excerpt.id, excerpt.text]));
  const resolve = (quote: unknown) => {
    if (
      typeof quote !== "string" ||
      !/^CV\d+(?:\s*[,;|+]\s*CV\d+)*$/.test(quote.trim())
    )
      return quote;
    return [...new Set(quote.match(/CV\d+/g))]
      .map((id) => {
        const original = source.get(id);
        if (original === undefined)
          throw new Error(
            "Bukti AI merujuk bagian CV yang tidak tersedia. Silakan coba review lagi.",
          );
        return original;
      })
      .join(CV_EVIDENCE_SEPARATOR);
  };
  const resolveField = (item: unknown, field: string, required = true) => {
    if (!item || typeof item !== "object") return item;
    const record = item as Record<string, unknown>;
    try {
      return { ...record, [field]: resolve(record[field]) };
    } catch (error) {
      if (required) throw error;
      // Leave invalid optional revision references for the validator to omit.
      return record;
    }
  };
  return {
    ...review,
    poin: Array.isArray(review.poin)
      ? review.poin.map((point) => resolveField(point, "bukti"))
      : review.poin,
    revisi: Array.isArray(review.revisi)
      ? review.revisi.map((revision) =>
          resolveField(revision, "sebelum", false),
        )
      : review.revisi,
  };
}

export function normalizeCvQuote(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[\u00ad\u200b\u200c\u200d\ufeff]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function cvQuoteExists(quote: string, normalizedSource: string) {
  return quote.split(CV_EVIDENCE_SEPARATOR).every((part) => {
    const normalized = normalizeCvQuote(part);
    return normalized.length > 0 && normalizedSource.includes(normalized);
  });
}
