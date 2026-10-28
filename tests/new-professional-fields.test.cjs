const fs = require("node:fs");
const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");
require.extensions[".css"] = () => {};

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    module._compile(outputText, filename);
  };
}

const { DEFAULT_CV, emptyCv, isCvData, cloneCv, loadSaved, storeSaved } = require("../lib/cv.ts");
const CvForm = require("../components/cv/CvForm.tsx").default;
const project = { nama: "Portal inventaris", peran: "Frontend Developer", periode: "2025", deskripsi: "Membangun antarmuka inventaris.\nMenghubungkan API." };
const certificate = { nama: "Dasar Web", penerbit: "Akademi Contoh", tahun: "2025" };
const professionalCv = () => ({
  ...emptyCv("professional"), nama: "Nama Pengguna", website: "contoh.test",
  proyek: [{ ...project }], softSkills: "Komunikasi\nKolaborasi", sertifikasi: [{ ...certificate }],
  keahlian: "JavaScript\nReact", hardSkills: "Analisis data\nPengujian perangkat lunak",
});

test("Professional ATS optional fields validate without rejecting older CVs", () => {
  assert.equal(isCvData(DEFAULT_CV), true);
  assert.equal(isCvData(emptyCv()), true);
  assert.equal(isCvData(emptyCv("professional")), true);
  const valid = professionalCv();
  assert.equal(isCvData(valid), true);
  for (const invalid of [
    { website: 12 }, { website: null }, { softSkills: [] }, { hardSkills: 12 }, { hardSkills: null },
    { proyek: {} }, { proyek: [null] }, { proyek: [{ ...project, nama: 123 }] },
    { proyek: [{ nama: "Missing fields" }] },
    { sertifikasi: null }, { sertifikasi: [null] },
    { sertifikasi: [{ ...certificate, tahun: 2025 }] },
    { sertifikasi: [{ nama: "Missing fields" }] },
  ]) assert.equal(isCvData({ ...valid, ...invalid }), false, JSON.stringify(invalid));
});

test("Professional ATS fields survive deep cloning and account-scoped storage", () => {
  const previousStorage = global.localStorage;
  const storage = new Map();
  global.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  try {
    const source = professionalCv();
    const copy = cloneCv(source);
    assert.equal(copy.hardSkills, source.hardSkills);
    copy.hardSkills = "Changed skill";
    assert.equal(source.hardSkills, "Analisis data\nPengujian perangkat lunak");
    copy.proyek[0].deskripsi = "Changed copy";
    copy.sertifikasi[0].nama = "Changed certificate";
    assert.equal(source.proyek[0].deskripsi, project.deskripsi);
    assert.equal(source.sertifikasi[0].nama, certificate.nama);
    const entry = { id: "professional-one", judul: "CV profesional", updatedAt: "2026-10-28", data: source };
    storeSaved([entry], "alice");
    assert.deepEqual(loadSaved("alice"), [entry]);
    assert.deepEqual(loadSaved("bob"), []);
    storeSaved([{ ...entry, id: "legacy", data: DEFAULT_CV }], "bob");
    assert.deepEqual(loadSaved("alice")[0].data, source);
    assert.deepEqual(loadSaved("bob")[0].data, DEFAULT_CV);
  } finally { global.localStorage = previousStorage; }
});

const descendants = node => React.isValidElement(node)
  ? [node, ...React.Children.toArray(node.props.children).flatMap(descendants)] : [];
const button = (tree, label) => descendants(tree).find(node => node.type === "button" && node.props.children === label);
const field = (tree, label, index = 0) => {
  const labels = descendants(tree).filter(node => node.type === "label" && React.Children.toArray(node.props.children).filter(child => typeof child === "string").join("") === label);
  return descendants(labels[index]).find(node => node.type === "input" || node.type === "textarea");
};

test("Professional ATS project and certification form edits preserve other profile and section data", () => {
  let value = professionalCv();
  const render = section => CvForm({ value, section, onChange: next => { value = next; } });
  field(render("profile"), "Website / portofolio").props.onChange({ target: { value: "portfolio.test" } });
  assert.equal(value.website, "portfolio.test");
  const firstProject = { ...value.proyek[0] };
  button(render("projects"), "Tambah proyek").props.onClick();
  field(render("projects"), "Nama proyek", 1).props.onChange({ target: { value: "Proyek kedua" } });
  field(render("projects"), "Deskripsi proyek, satu poin per baris", 1).props.onChange({ target: { value: "Poin satu\nPoin dua" } });
  assert.deepEqual(value.proyek[0], firstProject);
  assert.equal(value.proyek[1].deskripsi, "Poin satu\nPoin dua");
  descendants(render("projects")).filter(node => node.type === "button" && node.props.children === "Hapus proyek ini")[1].props.onClick();
  assert.deepEqual(value.proyek, [firstProject]);

  const firstCertificate = { ...value.sertifikasi[0] };
  button(render("certifications"), "Tambah sertifikasi").props.onClick();
  field(render("certifications"), "Nama sertifikasi", 1).props.onChange({ target: { value: "Sertifikasi kedua" } });
  field(render("certifications"), "Tahun sertifikasi", 1).props.onChange({ target: { value: "2026" } });
  assert.deepEqual(value.sertifikasi[0], firstCertificate);
  assert.equal(value.sertifikasi[1].tahun, "2026");
  descendants(render("certifications")).filter(node => node.type === "button" && node.props.children === "Hapus sertifikasi ini")[1].props.onClick();
  assert.deepEqual(value.sertifikasi, [firstCertificate]);
  descendants(render("skills")).find(node => node.props.label === "Soft skills").props.onChange("Kerja sama\nKomunikasi");
  descendants(render("skills")).find(node => node.props.label === "Hard skills").props.onChange("Analisis data");
  assert.equal(value.nama, "Nama Pengguna");
  assert.equal(value.website, "portfolio.test");
  assert.equal(value.softSkills, "Kerja sama\nKomunikasi");
  assert.equal(value.hardSkills, "Analisis data");
  assert.equal(value.keahlian, "JavaScript\nReact");
  assert.deepEqual(value.proyek, [firstProject]);
  assert.deepEqual(value.sertifikasi, [firstCertificate]);
  const legacy = CvForm({ value: DEFAULT_CV, onChange() {} });
  assert.equal(descendants(legacy).some(node => node.type === "input" && node.props.autoComplete === "url"), false);
  assert.equal(button(legacy, "Tambah proyek"), undefined);
  assert.equal(button(legacy, "Tambah sertifikasi"), undefined);
});

test("Professional ATS renders every reference section as editable text in A4 order", () => {
  const { renderToStaticMarkup } = require("react-dom/server");
  const Sheet = require("../components/cv/CvSheet.tsx").default;
  const { PROFESSIONAL_EXAMPLE } = require("../data/professional-example.ts");
  const { TEMPLATES } = require("../data/templates.ts");
  const html = renderToStaticMarkup(React.createElement(Sheet, { data: PROFESSIONAL_EXAMPLE, watermark: false, fill: true }));
  let previous = -1;
  for (const section of ["PROFESSIONAL SUMMARY", "WORK EXPERIENCE", "EDUCATION", "PROJECTS", "TECHNICAL SKILLS", "SOFT SKILLS", "CERTIFICATIONS"]) {
    const position = html.indexOf(`<h3>${section}</h3>`);
    assert.ok(position > previous, section);
    previous = position;
  }
  assert.ok(html.includes(PROFESSIONAL_EXAMPLE.nama.toUpperCase()));
  assert.ok(html.includes(PROFESSIONAL_EXAMPLE.website));
  assert.ok(html.includes("professional-projects"));
  assert.ok(html.includes("professional-soft-skills"));
  assert.ok(html.includes("professional-certifications"));
  assert.ok(!html.includes("<h3>HARD SKILLS</h3>"), "An empty optional category must not alter the reference layout");
  const withHardSkills = renderToStaticMarkup(React.createElement(Sheet, { data: { ...PROFESSIONAL_EXAMPLE, hardSkills: "Analisis data\nPengujian" }, watermark: false }));
  assert.ok(withHardSkills.indexOf("<h3>HARD SKILLS</h3>") > withHardSkills.indexOf("<h3>TECHNICAL SKILLS</h3>"));
  assert.ok(withHardSkills.indexOf("<h3>HARD SKILLS</h3>") < withHardSkills.indexOf("<h3>SOFT SKILLS</h3>"));
  assert.ok(withHardSkills.includes("<li>Analisis data</li><li>Pengujian</li>"));
  assert.ok(!html.includes("cv-fill"), "Fixed reference typography must not stretch in the gallery");
  assert.ok(!html.includes("<img"), "ATS content must remain text rather than a screenshot");
  assert.ok(TEMPLATES.some(template => template.id === "professional" && !template.plusOnly));
  const restored = { ...cloneCv(PROFESSIONAL_EXAMPLE), templateId: "adelaide" };
  assert.equal(isCvData(restored), true);
  assert.deepEqual(restored.proyek, PROFESSIONAL_EXAMPLE.proyek, "Changing template must retain additional sections");
});
