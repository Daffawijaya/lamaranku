export function reviewRoute({ busy, phase }: { busy: boolean; phase: string }) {
  if (busy) return "/dashboard/skor/proses";
  if (phase === "hasil") return "/dashboard/skor/hasil";
  return "/dashboard/skor";
}
