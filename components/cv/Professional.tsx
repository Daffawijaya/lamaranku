import type { CvData } from "../../lib/cv";

const lines = (value: string) => value.split(/\r?\n/).map(line => line.replace(/^\s*[•*-]\s*/, "").trim()).filter(Boolean);

function Bullets({ value }: { value: string }) {
  const items = lines(value);
  return items.length ? <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : null;
}

export function Professional({ cv }: { cv: CvData }) {
  const contacts = [cv.telepon, cv.email, cv.website].filter(Boolean);
  return <div className="cv-professional">
    <header className="professional-header">
      <h2>{(cv.nama || "NAMA LENGKAP").toUpperCase()}</h2>
      {cv.posisi && <p className="professional-role">{cv.posisi}</p>}
      {contacts.length > 0 && <p className="professional-contacts">{contacts.join("  |  ")}</p>}
      {cv.alamat && <p className="professional-address">{cv.alamat}</p>}
    </header>
    {cv.ringkasan.trim() && <section className="professional-section">
      <h3>PROFESSIONAL SUMMARY</h3><p className="professional-summary">{cv.ringkasan}</p>
    </section>}
    {cv.pengalaman.length > 0 && <section className="professional-section">
      <h3>WORK EXPERIENCE</h3>
      {cv.pengalaman.map((item, index) => <article key={index} className="professional-entry">
        <div className="professional-entry-heading"><h4>{item.perusahaan || "NAMA PERUSAHAAN"}</h4><span>{item.periode}</span></div>
        {item.jabatan && <p className="professional-entry-role">{item.jabatan}</p>}
        <Bullets value={item.deskripsi} />
      </article>)}
    </section>}
    {cv.pendidikan.length > 0 && <section className="professional-section">
      <h3>EDUCATION</h3>
      {cv.pendidikan.map((item, index) => <article key={index} className="professional-entry professional-education">
        <div className="professional-entry-heading"><h4>{item.sekolah || "NAMA INSTITUSI"}</h4><span>{item.tahun}</span></div>
        <p>{item.gelar}</p>
      </article>)}
    </section>}
    {!!cv.proyek?.length && <section className="professional-section professional-projects">
      <h3>PROJECTS</h3>
      {cv.proyek.map((item, index) => <article key={index} className="professional-entry">
        <div className="professional-entry-heading"><h4>{item.nama || "NAMA PROYEK"}</h4><span>{item.periode}</span></div>
        {item.peran && <p className="professional-entry-role">{item.peran}</p>}
        <Bullets value={item.deskripsi} />
      </article>)}
    </section>}
    {cv.keahlian.trim() && <section className="professional-section">
      <h3>TECHNICAL SKILLS</h3><Bullets value={cv.keahlian} />
    </section>}
    {cv.hardSkills?.trim() && <section className="professional-section">
      <h3>HARD SKILLS</h3><Bullets value={cv.hardSkills} />
    </section>}
    {cv.softSkills?.trim() && <section className="professional-section">
      <h3>SOFT SKILLS</h3><div className="professional-soft-skills"><Bullets value={cv.softSkills} /></div>
    </section>}
    {!!cv.sertifikasi?.length && <section className="professional-section">
      <h3>CERTIFICATIONS</h3>
      <ul className="professional-certifications">{cv.sertifikasi.map((item, index) => <li key={index}>
        <div><span>{[item.nama, item.penerbit].filter(Boolean).join(" - ")}</span><span>{item.tahun}</span></div>
      </li>)}</ul>
    </section>}
  </div>;
}
