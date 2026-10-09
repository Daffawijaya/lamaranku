"use client";

import { useEffect, useMemo, useState } from "react";
import TemplateGallery from "../../components/cv/TemplateGallery";
import CvForm from "../../components/cv/CvForm";
import CvSheet from "../../components/cv/CvSheet";
import { DEFAULT_CV, isPlus, loadSaved, storeSaved, type CvData, type SavedCv } from "../../lib/cv";
import { PLUS_PRICE, WA_NUMBER } from "../../data/features";
import { TEMPLATES, templateById } from "../../data/templates";
import HeroNavbar from "../../components/nav/HeroNavbar";
import Navbar from "../../components/nav/Navbar";

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;
const BTN = "inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold";

export default function CvBuilderPage() {
  const [cv, setCv] = useState<CvData>(DEFAULT_CV);
  const [step, setStep] = useState<"pilih" | "susun">("pilih");
  const [plus, setPlus] = useState(false);
  const [saved, setSaved] = useState<SavedCv[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [locked, setLocked] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [kind, setKind] = useState<"semua" | "ats" | "kreatif">("semua");

  useEffect(() => {
    setPlus(isPlus());
    setSaved(loadSaved());
    setJudul(`${DEFAULT_CV.nama} - ${templateById(DEFAULT_CV.templateId).name}`);
    try {
      const q = new URLSearchParams(window.location.search);
      const t = q.get("template");
      const k = q.get("kind");
      if (k === "ats" || k === "kreatif") setKind(k);
      if (t) {
        const found = TEMPLATES.find((x) => x.id === t);
        if (found) {
          if (found.plusOnly && !isPlus()) {
            setLocked(found.name);
          } else {
            setCv((v) => ({ ...v, templateId: found.id }));
            setJudul(`${DEFAULT_CV.nama} - ${found.name}`);
            setStep("susun");
          }
        }
      }
    } catch {}
  }, []);

  const tpl = useMemo(() => templateById(cv.templateId), [cv.templateId]);
  const limitHabis = !plus && editingId === null && saved.length >= 2;

  const pick = (id: string) => {
    setCv({ ...cv, templateId: id });
    setLocked(null);
    setJudul(`${cv.nama || "CV"} - ${templateById(id).name}`);
    setStep("susun");
    setNotice(null);
    document.getElementById("susun")?.scrollIntoView({ behavior: "smooth" });
  };

  const simpan = () => {
    if (!plus && editingId === null && saved.length >= 2) {
      setNotice("Batas Basic habis: 2 CV tersimpan. Upgrade Plus untuk tanpa batas, atau hapus salah satu CV lama.");
      return;
    }
    const entry: SavedCv = {
      id: editingId ?? `cv-${Date.now()}`,
      judul: judul.trim() === "" ? `${cv.nama || "CV"} - ${tpl.name}` : judul.trim(),
      updatedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      data: cv
    };
    const next = editingId ? saved.map((s) => (s.id === editingId ? entry : s)) : [...saved, entry];
    setSaved(next);
    storeSaved(next);
    setEditingId(entry.id);
    setNotice(`Tersimpan: ${entry.judul}. Total ${next.length} CV.`);
  };

  const buka = (s: SavedCv) => {
    setCv(s.data);
    setEditingId(s.id);
    setJudul(s.judul);
    setStep("susun");
    setNotice(null);
  };

  const hapus = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    storeSaved(next);
    if (editingId === id) setEditingId(null);
    setNotice("CV dihapus dari peramban ini.");
  };

  const baru = () => {
    setCv({ ...DEFAULT_CV, templateId: cv.templateId });
    setEditingId(null);
    setJudul("");
    setNotice(null);
  };

  return (
    <main className="bg-paper text-ink">
      <HeroNavbar />
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 lg:pt-24">
        <div className="no-print flex items-center justify-end gap-2 border-b border-ink/15 py-4 text-sm">
          <span className={`rounded-full px-3 py-1 font-bold ${plus ? "bg-materai text-white" : "bg-ink/10"}`}>
            {plus ? "Plus" : "Basic"}
          </span>
          <a href="/#harga" className={`${BTN} bg-ink text-white`}>Lihat harga</a>
        </div>

        <section className="py-8">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">Langkah 1 dari 3</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Pilih template CV</h1>
          <p className="mt-2 max-w-2xl text-muted">
            {TEMPLATES.length} template siap pakai: ATS Friendly untuk perusahaan besar dan BUMN,
            Kreatif untuk agensi dan startup. Template bertanda Plus terbuka setelah upgrade.
          </p>
          {step === "susun" && (
            <button onClick={() => setStep("pilih")} className={`${BTN} mt-4 border border-ink/25 bg-white`}>
              Ganti template (sedang: {tpl.name})
            </button>
          )}
          {step === "pilih" && (
            <div className="mt-4">
              <TemplateGallery activeId={cv.templateId} initialFilter={kind} onPick={pick} lockedNote={(t) => setLocked(t.name)} />
            </div>
          )}
          {locked && (
            <div className="mt-4 rounded-[10px] border border-stamp/40 bg-stamp/[0.06] p-4" role="alert">
              <p className="font-bold text-stamp">Template {locked} khusus Plus ({PLUS_PRICE}).</p>
              <p className="mt-1 text-sm">Template ATS gratis tetap bisa dipakai sekarang. Upgrade membuka semua template plus AI dan unduhan tanpa cap.</p>
              <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE} untuk buka template ${locked}`)} className={`${BTN} mt-3 bg-stamp text-white`}>
                Minta link bayar Plus
              </a>
            </div>
          )}
        </section>

        {step === "susun" && (
          <section id="susun" className="scroll-mt-6 border-t border-ink/15 pt-8">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">Langkah 2 dari 3: isi</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Isi data, hasil mengikuti template {tpl.name}</h2>
            <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
              <div className="no-print">
                <CvForm value={cv} onChange={(v) => { setCv(v); if (v.nama && judul === "") setJudul(`${v.nama} - ${tpl.name}`); }} />
              </div>
              <div className="lg:sticky lg:top-4">
                <div className="overflow-hidden rounded-[10px] border border-ink">
                  <div className="flex items-center justify-between bg-ink px-4 py-2 text-sm text-paper no-print">
                    <span>Pratinjau: {tpl.name} ({tpl.kind === "ats" ? "ATS" : "Kreatif"})</span>
                    <span>{plus ? "tanpa cap" : "cap Basic"}</span>
                  </div>
                  <CvSheet data={cv} watermark={!plus} />
                </div>

                <div className="mt-4 rounded-[10px] border border-ink/20 bg-white p-4 no-print">
                  <p className="font-mono text-xs uppercase tracking-wide text-muted">Langkah 3 dari 3: simpan dan unduh</p>
                  <label className="mt-2 block text-sm font-semibold">
                    Judul simpanan
                    <input
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-[16px]"
                      placeholder="Ridwan - Harvard"
                    />
                  </label>
                  <p className="mt-2 text-sm text-muted" role="status">
                    Tersimpan {saved.length} dari {plus ? "tanpa batas" : "2 CV"}.
                  </p>
                  {notice && <p className="mt-1 text-sm font-semibold">{notice}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={simpan} className={`${BTN} bg-ink text-white`}>
                      {editingId ? "Perbarui simpanan" : "Simpan CV ini"}
                    </button>
                    <button onClick={() => window.print()} className={`${BTN} border border-ink/25 bg-white`}>
                      Unduh PDF
                    </button>
                    <button onClick={baru} className={`${BTN} border border-ink/25 bg-white`}>
                      Mulai CV baru
                    </button>
                  </div>
                  {limitHabis && (
                    <div className="mt-3 rounded-lg border border-stamp/40 bg-stamp/[0.06] p-3 text-sm">
                      <p className="font-bold text-stamp">Simpanan penuh.</p>
                      <a href={wa(`Halo Lamaranku, simpanan 2 CV saya penuh, saya mau upgrade Plus ${PLUS_PRICE}`)} className={`${BTN} mt-2 bg-stamp text-white`}>
                        Minta link bayar Plus
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-[10px] border border-ink/20 bg-white p-4 no-print">
                  <h3 className="font-display text-lg font-bold">CV tersimpan di peramban ini</h3>
                  {saved.length === 0 ? (
                    <p className="mt-1 text-sm text-muted">Belum ada. Simpanan pertama gratis, tanpa daftar.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-ink/10">
                      {saved.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                          <span>
                            <span className="font-semibold">{s.judul}</span>
                            <span className="block text-xs text-muted">{templateById(s.data.templateId).name} • {s.updatedAt}</span>
                          </span>
                          <span className="flex shrink-0 gap-2">
                            <button onClick={() => buka(s)} className="inline-flex min-h-[44px] items-center rounded-lg border border-ink/25 px-3">Buka</button>
                            <button onClick={() => hapus(s.id)} className="inline-flex min-h-[44px] items-center rounded-lg border border-ink/25 px-3">Hapus</button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
