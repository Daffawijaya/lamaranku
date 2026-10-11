"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CvForm from "../../components/cv/CvForm";
import CvSheet from "../../components/cv/CvSheet";
import { DEFAULT_CV, isPlus, loadSaved, storeSaved, type CvData, type SavedCv } from "../../lib/cv";
import { PLUS_PRICE, WA_NUMBER } from "../../data/features";
import { wa } from "../../lib/wa";
import { TEMPLATES, templateById } from "../../data/templates";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TbFileTextFilled } from "react-icons/tb";
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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const filteredTpl = TEMPLATES.filter((t) => kind === "semua" || t.kind === kind);
  const pageCount = Math.max(1, Math.ceil(filteredTpl.length / PAGE_SIZE));
  const visibleTpl = filteredTpl.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

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
  const goGaleri = (k: "semua" | "ats" | "kreatif") => {
    setKind(k);
    setStep("pilih");
    requestAnimationFrame(() => {
      document.getElementById("pilih")?.scrollIntoView({ behavior: "smooth" });
    });
  };
  const limitHabis = !plus && editingId === null && saved.length >= 2;

  const pick = (id: string) => {
    setCv({ ...cv, templateId: id });
    setLocked(null);
    setJudul(`${cv.nama || "CV"} - ${templateById(id).name}`);
    setStep("susun");
    setNotice(null);
    document.getElementById("susun")?.scrollIntoView({ behavior: "smooth" });
  };

  const choose = (id: string) => {
    const found = templateById(id);
    if (found.plusOnly && !plus) {
      setLocked(found.name);
      requestAnimationFrame(() => {
        document.getElementById("catatan")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } else {
      pick(id);
    }
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
        <section className="relative overflow-hidden bg-white">
          <div className="relative mx-auto flex max-w-[1310px] flex-col items-center px-5 pb-14 pt-14 text-center sm:px-4 lg:px-6">
            <PageIntro
              label="CV Builder"
              icon={
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eb1000] text-white">
                  <TbFileTextFilled className="h-6 w-6" />
                </span>
              }
              title="Aplikasi CV yang cepat dan mudah."
              description={<>Buat CV ATS dan Kreatif yang memukau untuk lamaran apa pun. {TEMPLATES.length} template siap pakai. Pilih. Isi. Unduh. Mudah. {plus ? "Paket Plus aktif: tanpa batas." : "Paket Basic: 2 CV tersimpan."}</>}
              align="center"
              titleClassName="max-w-[820px]"
              descriptionClassName="max-w-[660px]"
            />
            <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Saring jenis template">
              {(["semua", "ats", "kreatif"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => { setKind(k); setPage(0); }}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                    kind === k ? "bg-black text-white" : "border border-black bg-transparent text-black hover:bg-black/5"
                  }`}
                >
                  {k === "semua" ? "Semua template" : k === "ats" ? "ATS Friendly" : "Kreatif"}
                </button>
              ))}
            </div>
            <div className="relative mt-6 w-full">
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_12%,black_88%,transparent_100%)]">
                <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-pink-300/50 blur-3xl" />
                <div className="absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-blue-300/50 blur-3xl" />
                <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-yellow-200/70 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-green-200/50 blur-3xl" />
                <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-purple-300/40 blur-3xl" />
              </div>
              <div id="pilih" className="relative grid w-full scroll-mt-28 grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
              {visibleTpl.map((t) => {
                const active = t.id === cv.templateId;
                const lockedTpl = t.plusOnly && !plus;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => choose(t.id)}
                    aria-pressed={active}
                    aria-label={lockedTpl ? `${t.name}, khusus Plus` : `Pakai template ${t.name}`}
                    className={`group relative flex flex-col rounded-2xl border border-white bg-white/30 p-3 text-left backdrop-blur transition-shadow hover:shadow-lg ${
                      active ? "ring-2 ring-[#3b63fb]" : ""
                    }`}
                  >
                    <div className="aspect-[210/297] overflow-hidden rounded-xl bg-[#f8f8f8]" aria-hidden="true">
                      <div className="pointer-events-none origin-top-left select-none" style={{ width: "200%", transform: "scale(0.5)" }}>
                        <CvSheet data={{ ...DEFAULT_CV, templateId: t.id }} watermark={false} />
                      </div>
                    </div>
                    {lockedTpl && (
                      <span className="absolute right-5 top-5 rounded-full bg-[#2c2c2c] px-3 py-1 text-xs font-bold text-white">
                        Plus
                      </span>
                    )}
                    <p className="px-2 pb-2 pt-3 text-lg font-bold">{t.name}</p>
                  </button>
                );
              })}
            </div>
            {pageCount > 1 && (
              <div className="mt-6 flex justify-center gap-2" role="navigation" aria-label="Halaman template">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPage(i);
                      document.getElementById("pilih")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    aria-label={`Halaman ${i + 1}`}
                    aria-current={page === i ? "page" : undefined}
                    className={`h-9 w-9 rounded-full text-sm font-bold transition-colors ${
                      page === i ? "bg-black text-white" : "border border-black bg-transparent text-black hover:bg-black/5"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            {locked && (
              <div id="catatan" className="relative mx-auto mt-8 w-full max-w-3xl rounded-2xl bg-white/70 p-5 text-left backdrop-blur sm:p-6" role="alert">
                <p className="font-bold">Template {locked} khusus Plus ({PLUS_PRICE}).</p>
                <p className="mt-1 text-sm leading-6 text-black/65">Template ATS gratis tetap bisa dipakai sekarang. Upgrade membuka semua template plus AI dan unduhan tanpa cap.</p>
                <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE} untuk buka template ${locked}`)} className={`${BTN_BLUE} mt-4`}>
                  Minta link bayar Plus
                </a>
              </div>
            )}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f8f8] py-16 lg:py-24">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-black sm:text-4xl">
              Buat CV apa pun, cepat dan mudah.
            </h2>
            <div className="mt-8 space-y-6">
              <div className="grid overflow-hidden rounded-[20px] bg-white md:grid-cols-2">
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <h3 className="text-2xl font-bold text-black sm:text-[28px]">Mulai dari template ATS.</h3>
                  <p className="mt-3 leading-7 text-[#505050]">
                    Satu kolom teks yang lolos sistem penyaring BUMN, bank, dan perusahaan besar.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {TEMPLATES.filter((t) => t.kind === "ats" && !t.plusOnly).slice(0, 3).map((t) => (
                      <button key={t.id} type="button" onClick={() => goGaleri("ats")} className="text-sm font-bold text-[#1473e6] hover:underline">
                        {t.name}
                      </button>
                    ))}
                    <button type="button" onClick={() => goGaleri("ats")} className="text-sm font-bold text-[#1473e6] hover:underline">
                      Lihat semua template ATS
                    </button>
                  </div>
                </div>
                <div className="bg-[#f0f0f0] p-6 sm:p-8">
                  <div className="h-72 overflow-hidden rounded-xl bg-white" aria-hidden="true">
                    <div className="pointer-events-none origin-top-left select-none" style={{ width: "166.67%", transform: "scale(0.6)" }}>
                      <CvSheet data={{ ...DEFAULT_CV, templateId: "harvard" }} watermark={false} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid overflow-hidden rounded-[20px] bg-white md:grid-cols-2">
                <div className="bg-[#f0f0f0] p-6 sm:p-8 md:order-first">
                  <div className="h-72 overflow-hidden rounded-xl bg-white" aria-hidden="true">
                    <div className="pointer-events-none origin-top-left select-none" style={{ width: "166.67%", transform: "scale(0.6)" }}>
                      <CvSheet data={{ ...DEFAULT_CV, templateId: "minimalist" }} watermark={false} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <h3 className="text-2xl font-bold text-black sm:text-[28px]">Mulai dari template Kreatif.</h3>
                  <p className="mt-3 leading-7 text-[#505050]">
                    Visual berani untuk agensi, startup, media, dan industri konten.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {TEMPLATES.filter((t) => t.kind === "kreatif" && !t.plusOnly).slice(0, 3).map((t) => (
                      <button key={t.id} type="button" onClick={() => goGaleri("kreatif")} className="text-sm font-bold text-[#1473e6] hover:underline">
                        {t.name}
                      </button>
                    ))}
                    <button type="button" onClick={() => goGaleri("kreatif")} className="text-sm font-bold text-[#1473e6] hover:underline">
                      Lihat semua template Kreatif
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid overflow-hidden rounded-[20px] bg-white md:grid-cols-2">
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <h3 className="text-2xl font-bold text-black sm:text-[28px]">Nilai cepat dengan AI.</h3>
                  <p className="mt-3 leading-7 text-[#505050]">
                    Upload PDF dan biarkan AI memeriksa kesiapan ATS dalam hitungan detik.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    <Link href="/skor" className="text-sm font-bold text-[#1473e6] hover:underline">
                      Cek Skor CV
                    </Link>
                    <Link href="/#ai-plus" className="text-sm font-bold text-[#1473e6] hover:underline">
                      Lihat AI Plus
                    </Link>
                  </div>
                </div>
                <div className="min-h-[280px] p-6 sm:p-8 md:order-last">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
                    alt=""
                    aria-hidden="true"
                    className="h-72 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {step === "susun" && (
          <section id="susun" className="scroll-mt-24 bg-white py-16 lg:py-24">
            <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/55">Isi dan unduh</p>
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
