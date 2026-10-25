export function reviewProgress(
  phase: string,
  elapsed: number,
  currentPage: number,
  totalPages: number,
) {
  const reading =
    totalPages > 0
      ? Math.min(100, Math.round((currentPage / totalPages) * 100))
      : 0;
  // The AI endpoint returns one final response, so this is a bounded estimate.
  const ai = Math.min(
    95,
    Math.floor((1 - Math.exp(-Math.max(0, elapsed) / 30)) * 100),
  );
  switch (phase) {
    case "lanjut":
      return { step: 0, overall: 5, reading, ai };
    case "baca":
      return { step: 1, overall: 10 + Math.round(reading * 0.25), reading, ai };
    case "nilai":
      return {
        step: 2,
        overall: 35 + Math.floor((ai * 55) / 100),
        reading,
        ai,
      };
    case "validasi":
      return { step: 3, overall: 95, reading, ai };
    case "hasil":
      return { step: 4, overall: 100, reading: 100, ai: 100 };
    default:
      return { step: 0, overall: 0, reading: 0, ai: 0 };
  }
}
