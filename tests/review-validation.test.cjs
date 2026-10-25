const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");

// Run the existing TypeScript validators with Node's test runner, without a new dependency.
require.extensions[".ts"] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  module._compile(result.outputText, filename);
};
const { cvExcerpts, resolveCvEvidence } = require("../lib/cv-evidence.ts");
const { CRITERIA, validateReview, calculateScore } = require("../lib/skor.ts");
const text = "Pengembang React mengolah 500 data.\nLulus S1 Informatika tahun 2024.";
const excerpts = cvExcerpts(text);
function fixture() {
  return {
    ringkasan: "Ringkasan pengujian",
    poin: CRITERIA.map(c => ({ id: c.id, nilai: 80, catatan: "Catatan", bukti: "CV001", saran: "Perbaikan" })),
    kekuatan: ["React"],
    prioritas: [{ masalah: "Struktur", tindakan: "Rapikan", dampak: "Lebih jelas" }],
    revisi: [{ sebelum: "CV001", sesudah: "Mengolah 500 data menggunakan React.", alasan: "Lebih ringkas" }],
    kecocokan: { terpenuhi: [], belumTerbukti: [] },
    batasan: [],
  };
}
const validate = value => validateReview(resolveCvEvidence(value, excerpts), text, false);

test("invalid optional revisions are omitted with a notice and do not change valid scores", () => {
  const expected = calculateScore(validate(fixture()).poin);
  for (const invalid of [null, { sebelum: "CV999", sesudah: "Contoh", alasan: "Alasan" }, { sebelum: "Mengolah 999 data.", sesudah: "Contoh", alasan: "Alasan" }]) {
    const value = fixture();
    value.revisi.push(invalid);
    const result = validate(value);
    assert.equal(result.revisi.length, 1);
    assert.equal(calculateScore(result.poin), expected);
    assert.ok(result.batasan.some(line => line.includes("contoh revisi")));
  }
});
test("missing optional sections produce notices instead of fabricated content", () => {
  for (const field of ["revisi", "prioritas", "kekuatan", "batasan"]) {
    const value = fixture();
    delete value[field];
    const result = validate(value);
    assert.equal(result[field].length, field === "batasan" ? 1 : 0);
    assert.ok(result.batasan.length > 0);
  }
});
test("all ten distinct criteria and numeric scores remain required", () => {
  const missing = fixture(); missing.poin.pop();
  assert.throws(() => validate(missing), /10 kriteria/);
  const duplicate = fixture(); duplicate.poin[1].id = duplicate.poin[0].id;
  assert.throws(() => validate(duplicate), /duplikat/);
  for (const invalid of ["80", -1, 101, NaN]) {
    const value = fixture(); value.poin[0].nilai = invalid;
    assert.throws(() => validate(value), /nilai tidak valid/);
  }
});
test("multiple evidence excerpts are supported while unknown references and changed facts are rejected", () => {
  const valid = fixture(); valid.poin[0].bukti = "CV001, CV002";
  assert.ok(validate(valid).poin[0].bukti.includes("[…]"));
  for (const invalid of ["CV001, CV999", "Mengolah 999 data.", "\u200b"]) {
    const value = fixture(); value.poin[0].bukti = invalid;
    assert.throws(() => validate(value), /Bukti AI/);
  }
});
test("job relevance is not scored without a job description", () => {
  const value = fixture(); value.poin.find(p => p.id === "relevansi").saran = "";
  const relevance = validate(value).poin.find(p => p.id === "relevansi");
  assert.equal(relevance.nilai, null);
  assert.equal(relevance.status, "ragu");
  assert.ok(relevance.saran.includes("deskripsi lowongan"));
});
