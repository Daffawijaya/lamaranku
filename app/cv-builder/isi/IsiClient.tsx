"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CvForm from "../../../components/cv/CvForm";
import CvSheet from "../../../components/cv/CvSheet";
import { DEFAULT_CV, cloneCv, isPlus, loadSaved, newCvId, storeSaved, type CvData, type SavedCv } from "../../../lib/cv";
import { PLUS_PRICE } from "../../../data/features";
import { wa } from "../../../lib/wa";
import { TEMPLATES, templateById } from "../../../data/templates";
import { supabaseBrowser } from "../../../lib/supabase/client";
import Navbar from "../../../components/jds/SiteNavbar";
import { SiteFooter } from "../../../components/jds/SiteFooter";

const BTN_BLUE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3b63fb] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#274dea]";
const BTN_OUTLINE = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";

export default function IsiClient() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [cv, setCv] = useState<CvData>(DEFAULT_CV);
  const [plus, setPlus] = useState(false);
  const [saved, setSaved] = useState<SavedCv[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const tpl = useMemo(() => templateById(cv.templateId), [cv.templateId]);
  const limitHabis = !plus && editingId === null && saved.length >= 2;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = new URLSearchParams(window.location.search);
        const t = q.get("template");
        const found = t ? TEMPLATES.find((x) => x.id === t) : undefined;
        const initial = found ?? templateById(DEFAULT_CV.templateId);
        if (alive) {
          setCv((prev) => ({ ...prev, templateId: initial.id }));
          setJudul(`${DEFAULT_CV.nama} - ${initial.name}`);
        }
        const { data } = await supabaseBrowser().auth.getUser();
        if (!alive) return;
        if (!data.user) {
          router.replace(`/masuk?next=${encodeURIComponent(`/cv-builder/isi${window.location.search}`)}`);
          setAuthed(false);
          return;
        }
        setPlus(isPlus());
        setSaved(loadSaved());
        setAuthed(true);
      } catch {
        if (alive) setNotice("Auth belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      }
    })();
    return () => { alive = false; };
  }, [router]);

  const simpan = () => {
    if (limitHabis) {
      setNotice("Batas Basic habis: 2 CV tersimpan. Upgrade Plus untuk tanpa batas, atau hapus salah satu CV lama.");
      return;
    }
    const entry: SavedCv = {
      id: editingId ?? newCvId(),
      judul: judul.trim() === "" ? `${cv.nama || "CV"} - ${tpl.name}` : judul.trim(),
      updatedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      data: cloneCv(cv)
    };
    const next = editingId ? saved.map((s) => (s.id === editingId ? entry : s)) : [...saved, entry];
    setSaved(next);
    storeSaved(next);
    setEditingId(entry.id);
    setNotice(`Tersimpan: ${entry.judul}. Total ${next.length} CV.`);
  };

  const buka = (s: SavedCv) => {
    setCv(cloneCv(s.data));
    setEditingId(s.id);
    setJudul(s.judul);
    setNotice(null);
  };

  const hapus = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    storeSaved(next);
    if (editingId === id) {
      setEditingId(null);
      setJudul("");
    }
    setNotice("CV dihapus dari peramban ini.");
  };

  const baru = () => {
    setCv({ ...DEFAULT_CV, templateId: cv.templateId });
    setEditingId(null);
    setJudul("");
    setNotice(null);
  };

  if (authed !== true) {
    return (
      <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
        <div className="no-print">
          <Navbar />
        </div>
        <main>
          <div className="mx-auto max-w-[1310px] px-5 py-20 text-center sm:px-4 lg:px-6" role="status">
            <p className="text-sm text-black/65">{notice ?? "Memeriksa sesi…"}</p>
          </div>
        </main>
        <div className="no-print">
          <SiteFooter variant="light" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <div className="no-print">
        <Navbar />
      </div>

      <main>
        <section id="susun" className="scroll-mt-24 bg-white py-16 lg:py-24 print:py-0">
          <div className="mx-auto max-w-[1310px] px-5 sm:px-4 lg:px-6 print:max-w-none print:px-0">
            <div className="mx-auto max-w-3xl text-center no-print">
              <Link href="/cv-builder" className="text-sm font-bold text-[#3b63fb] underline underline-offset-2">
                ← Ganti template
              </Link>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-black/55">Isi dan unduh</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
                Isi data, lalu simpan dan unduh.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/70 sm:text-lg">
                Hasil mengikuti template {tpl.name}. {plus ? "Plus aktif: tanpa cap." : "Basic: hasil memakai cap contoh."}
              </p>
            </div>

            <div className="mt-10 grid items-start gap-8 lg:grid-cols-2 print:mt-0 print:block print:gap-0">
              <div className="no-print">
                <CvForm value={cv} onChange={(v) => {
                  setCv(v);
                  setJudul((prev) => (prev === "" && v.nama ? `${v.nama} - ${templateById(v.templateId).name}` : prev));
                }} />
              </div>
              <div className="lg:sticky lg:top-24 print:static">
                <div className="overflow-hidden rounded-2xl border border-[#dadada] bg-white print:rounded-none print:border-0">
                  <CvSheet data={cv} watermark={!plus} id="cv-sheet" />
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
                    <button type="button" onClick={simpan} className={BTN_BLUE}>
                      {editingId ? "Perbarui simpanan" : "Simpan CV ini"}
                    </button>
                    <button type="button" onClick={() => window.print()} className={BTN_OUTLINE}>
                      Unduh PDF
                    </button>
                    <button type="button" onClick={baru} className={BTN_OUTLINE}>
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
                    <p className="mt-1 text-sm text-black/65">Belum ada. Simpan CV pertamamu di sini.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-[#dadada]">
                      {saved.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-2 py-3 text-sm">
                          <span>
                            <span className="font-bold">{s.judul}</span>
                            <span className="block text-xs text-black/55">{templateById(s.data.templateId).name} • {s.updatedAt}</span>
                          </span>
                          <span className="flex shrink-0 gap-2">
                            <button type="button" onClick={() => buka(s)} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[#2c2c2c] px-4 text-sm font-bold transition-colors hover:bg-[#2c2c2c] hover:text-white">Buka</button>
                            <button type="button" onClick={() => hapus(s.id)} className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold text-black/55 transition-colors hover:text-black">Hapus</button>
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
      </main>

      <div className="no-print">
        <SiteFooter variant="light" />
      </div>
    </div>
  );
}
