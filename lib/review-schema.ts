import { CRITERIA } from "./skor";

const text = { type: "string" };
const list = { type: "array", items: text, maxItems: 15 };
const object = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const REVIEW_SCHEMA = object({
  ringkasan: text,
  poin: {
    type: "array",
    minItems: 10,
    maxItems: 10,
    items: object({
      id: { type: "string", enum: CRITERIA.map((criterion) => criterion.id) },
      nilai: { type: ["number", "null"], minimum: 0, maximum: 100 },
      catatan: text,
      bukti: {
        type: "string",
        description:
          "ID potongan CV yang mendukung, misalnya CV001 atau CV001, CV002. Kosong jika tidak ada bukti.",
      },
      saran: {
        type: "string",
        description:
          "Tindakan konkret; jika tidak dinilai, jelaskan informasi yang diperlukan.",
      },
    }),
  },
  kekuatan: list,
  prioritas: {
    type: "array",
    maxItems: 5,
    items: object({ masalah: text, tindakan: text, dampak: text }),
  },
  revisi: {
    type: "array",
    maxItems: 5,
    items: object({
      sebelum: {
        type: "string",
        description: "Satu ID potongan CV asli, misalnya CV001.",
      },
      sesudah: text,
      alasan: text,
    }),
  },
  kecocokan: object({ terpenuhi: list, belumTerbukti: list }),
  batasan: list,
});
