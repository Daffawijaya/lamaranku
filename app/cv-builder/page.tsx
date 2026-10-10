"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TemplateGallery from "../../components/cv/TemplateGallery";
import CvForm from "../../components/cv/CvForm";
import CvSheet from "../../components/cv/CvSheet";
import { DEFAULT_CV, isPlus, loadSaved, storeSaved, type CvData, type SavedCv } from "../../lib/cv";
import { PLUS_PRICE, WA_NUMBER } from "../../data/features";
import { wa } from "../../lib/wa";
import { TEMPLATES, templateById } from "../../data/templates";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { SiteFooter } from "../../components/jds/SiteFooter";

const BTN_BLUE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3b63fb] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#274dea]";
const BTN_OUTLINE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";

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
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <Navbar />

      <main>
        <section className="scroll-mt-28 bg-[#f5f5f5]">
          <div className="grid w-full lg:grid-cols-2">
            <div className="flex min-h-[560px] flex-col justify-center px-5 py-8 sm:px-4 lg:min-h-[calc(100svh-4rem)] lg:py-14 lg:pl-[max(1.5rem,calc((100vw-1310px)/2+1.5rem))] lg:pr-16">
              <PageIntro
                label="CV Builder"
                title="Pilih template, isi, unduh."
                description={`${TEMPLATES.length} template siap pakai: ATS Friendly untuk perusahaan besar dan BUMN, Kreatif untuk agensi dan startup. ${plus ? "Paket Plus aktif: tanpa batas." : "Paket Basic: 2 CV tersimpan."}`}
                titleClassName="max-w-[480px]"
                descriptionClassName="max-w-[500px]"
              />
              <p className="mt-6 text-lg font-bold">Mulai dari template yang cocok.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#galeri" className={BTN_BLUE}>
                  Pilih template
                </a>
                <Link href="/harga" className={BTN_OUTLINE}>
                  Lihat harga
                </Link>
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden lg:min-h-[calc(100svh-4rem)]" aria-hidden="true">
              <div className="absolute inset-6 overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="max-h-full overflow-hidden">
                  <CvSheet data={{ ...DEFAULT_CV, templateId: cv.templateId }} watermark={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="galeri" className="scroll-mt-24 bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55">Langkah 1 dari 3</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
                Pilih template CV.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
                Template bertanda Plus terbuka setelah upgrade. Klik pakai untuk langsung mengisi.
              </p>
            </div>

            {step === "susun" && (
              <div className="mt-8 text-center">
                <button onClick={() => setStep("pilih")} className={BTN_OUTLINE}>
                  Ganti template (sedang: {tpl.name})
                </button>
              </div>
            )}
            {step === "pilih" && (
              <div className="mt-8">
                <TemplateGallery activeId={cv.templateId} initialFilter={kind} onPick={pick} lockedNote={(t) => setLocked(t.name)} />
              </div>
            )}
            {locked && (
              <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#f8f8f8] p-5 sm:p-6" role="alert">
                <p className="font-bold">Template {locked} khusus Plus ({PLUS_PRICE}).</p>
                <p className="mt-1 text-sm leading-6 text-black/65">Template ATS gratis tetap bisa dipakai sekarang. Upgrade membuka semua template plus AI dan unduhan tanpa cap.</p>
                <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE} untuk buka template ${locked}`)} className={`${BTN_BLUE} mt-4`}>
                  Minta link bayar Plus
                </a>
              </div>
            )}
          </div>
        </section>

        {step === "susun" && (
          <section id="susun" className="scroll-mt-24 bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55">Langkah 2 dan 3 dari 3</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
                  Isi data, lalu simpan dan unduh.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
                  Hasil mengikuti template {tpl.name}. {plus ? "Plus aktif: tanpa cap." : "Basic: hasil memakai cap contoh."}
                </p>
              </div>

              <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
                <div className="no-print">
                  <CvForm value={cv} onChange={(v) => { setCv(v); if (v.nama && judul === "") setJudul(`${v.nama} - ${tpl.name}`); }} />
                </div>
                <div className="lg:sticky lg:top-24">
                  <div className="overflow-hidden rounded-2xl border border-[#dadada] bg-white">
                    <CvSheet data={cv} watermark={!plus} />
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8f8f8] p-5 sm:p-6 no-print">
                    <label className="block text-sm font-bold text-[#2c2c2c]">
                      Judul simpanan
                      <input
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#b7b7b7] bg-white px-4 py-3 text-base text-[#2c2c2c] transition-colors hover:border-[#6d6d6d] focus:border-[#1473e6] focus:outline-none focus:ring-2 focus:ring-[#1473e6]/20"
                        placeholder="Ridwan - Harvard"
                      />
                    </label>
                    <p className="mt-2 text-sm text-black/65" role="status">
                      Tersimpan {saved.length} dari {plus ? "tanpa batas" : "2 CV"}.
                    </p>
                    {notice && <p className="mt-1 text-sm font-bold">{notice}</p>}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button onClick={simpan} className={BTN_BLUE}>
                        {editingId ? "Perbarui simpanan" : "Simpan CV ini"}
                      </button>
                      <button onClick={() => window.print()} className={BTN_OUTLINE}>
                        Unduh PDF
                      </button>
                      <button onClick={baru} className={BTN_OUTLINE}>
                        Mulai CV baru
                      </button>
                    </div>
                    {limitHabis && (
                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm">
                        <p className="font-bold">Simpanan penuh.</p>
                        <a href={wa(`Halo Lamaranku, simpanan 2 CV saya penuh, saya mau upgrade Plus ${PLUS_PRICE}`)} className={`${BTN_BLUE} mt-2`}>
                          Minta link bayar Plus
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f8f8f8] p-5 sm:p-6 no-print">
                    <h3 className="text-lg font-bold">CV tersimpan di peramban ini</h3>
                    {saved.length === 0 ? (
                      <p className="mt-1 text-sm text-black/65">Belum ada. Simpanan pertama gratis, tanpa daftar.</p>
                    ) : (
                      <ul className="mt-2 divide-y divide-[#dadada]">
                        {saved.map((s) => (
                          <li key={s.id} className="flex items-center justify-between gap-2 py-3 text-sm">
                            <span>
                              <span className="font-bold">{s.judul}</span>
                              <span className="block text-xs text-black/55">{templateById(s.data.templateId).name} • {s.updatedAt}</span>
                            </span>
                            <span className="flex shrink-0 gap-2">
                              <button onClick={() => buka(s)} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#2c2c2c] px-4 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">Buka</button>
                              <button onClick={() => hapus(s.id)} className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold text-black/55 transition-colors hover:text-black">Hapus</button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
