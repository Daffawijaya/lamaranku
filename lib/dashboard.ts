import type { CvData, SavedCv } from "./cv";

export function profileHue(seed: string): number {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % 360;
}

const filled = (value: string) => value.trim().length > 0;
const percent = (values: boolean[]) =>
  Math.round((values.filter(Boolean).length / values.length) * 100);

export function cvSections(cv: CvData) {
  return [
    {
      name: "Informasi kontak",
      value: percent(
        [cv.nama, cv.posisi, cv.email, cv.telepon, cv.alamat].map(filled),
      ),
    },
    { name: "Ringkasan profil", value: filled(cv.ringkasan) ? 100 : 0 },
    {
      name: "Pengalaman kerja",
      value: cv.pengalaman.length
        ? percent(
            cv.pengalaman.flatMap((item) =>
              [item.jabatan, item.perusahaan, item.periode, item.deskripsi].map(
                filled,
              ),
            ),
          )
        : 0,
    },
    {
      name: "Pendidikan",
      value: cv.pendidikan.length
        ? percent(
            cv.pendidikan.flatMap((item) =>
              [item.gelar, item.sekolah, item.tahun].map(filled),
            ),
          )
        : 0,
    },
    { name: "Keahlian", value: filled(cv.keahlian) ? 100 : 0 },
  ];
}

export function cvCompletion(cv: CvData) {
  return Math.round(
    cvSections(cv).reduce((sum, section) => sum + section.value, 0) / 5,
  );
}

// Older CVs store an Indonesian display date rather than an ISO timestamp.
export function savedCvDate(value: string): Date | null {
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mei",
    "jun",
    "jul",
    "agu",
    "sep",
    "okt",
    "nov",
    "des",
  ];
  const match = value.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (match) {
    const month = months.indexOf(match[2].slice(0, 3));
    if (month >= 0) return new Date(Number(match[3]), month, Number(match[1]));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function downloadDashboardSummary(entries: SavedCv[]) {
  const cell = (value: string | number) => {
    const text =
      typeof value === "string" && /^[=+@\-\t\r]/.test(value)
        ? "'" + value
        : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    ["Nama CV", "Diperbarui", "Kelengkapan (%)"],
    ...entries.map((cv) => [cv.judul, cv.updatedAt, cvCompletion(cv.data)]),
  ];
  const blob = new Blob(
    ["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ringkasan-lamaranku.csv";
  link.click();
  URL.revokeObjectURL(url);
}
