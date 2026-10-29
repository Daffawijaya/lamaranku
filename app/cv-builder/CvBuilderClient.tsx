"use client";

import { T, LocalizedAttributes } from "../../components/i18n/LanguageProvider";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import CvSheet from "../../components/cv/CvSheet";
import { DEFAULT_CV, isPlus } from "../../lib/cv";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";
import { TEMPLATES, templateById, type TemplateId, type TemplateKind } from "../../data/templates";
import Navbar from "../../components/jds/SiteNavbar";
import { PageIntro } from "../../components/jds/PageIntro";
import { TbFileTextFilled } from "react-icons/tb";
import { SiteFooter } from "../../components/jds/SiteFooter";
import { FilterTabs } from "../../components/FilterTabs";
import { ProfessionalPreview } from "../../components/cv/ProfessionalPreview";

const PAGE_SIZE = 8;
type KindFilter = "semua" | TemplateKind;

export default function CvBuilderClient({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const loader = useRef(useTopLoader()).current;
  const [plus, setPlus] = useState(false);
  const [kind, setKind] = useState<KindFilter>("semua");
  const [page, setPage] = useState(0);

  const filteredTpl = useMemo(() => TEMPLATES.filter((t) => kind === "semua" || t.kind === kind), [kind]);
  const pageCount = Math.max(1, Math.ceil(filteredTpl.length / PAGE_SIZE));
  const visibleTpl = useMemo(() => filteredTpl.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [filteredTpl, page]);

  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  useEffect(() => {
    setPlus(isPlus());
    try {
      const q = new URLSearchParams(window.location.search);
      const k = q.get("kind");
      if (k === "ats" || k === "kreatif") {
        setKind(k);
        setPage(0);
      }
      const t = q.get("template");
      const found = t ? TEMPLATES.find((x) => x.id === t) : undefined;
      if (found) {
        if (found.plusOnly && !isPlus()) {
          requestAnimationFrame(() => {
            document.getElementById("catatan")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        } else {
          loader.start();
          router.replace(`/dashboard/cv-builder?template=${found.id}`);
        }
      }
    } catch {}
  }, [router, loader]);

  const choose = (id: TemplateId) => {
    const found = templateById(id);
    if (found.plusOnly && !plus) {
      requestAnimationFrame(() => {
        document.getElementById("catatan")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } else {
      loader.start();
      router.push(`/dashboard/cv-builder?template=${found.id}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#2c2c2c] antialiased">
      <div className="no-print contents">
        <Navbar />
      </div>

      <main>
        <section className="relative overflow-hidden bg-white no-print">
          <div className="relative mx-auto flex max-w-[1310px] flex-col items-center px-5 pb-14 pt-14 text-center sm:px-4 lg:px-6">
            <LocalizedAttributes><PageIntro
              label="CV Builder"
              icon={
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eb1000] text-white">
                  <TbFileTextFilled className="h-6 w-6" />
                </span>
              }
              title="Buat CV ATS Gratis dengan CV Builder"
              description={<><T text={"Buat CV ATS dan Kreatif yang memukau untuk lamaran apa pun. "} />{TEMPLATES.length} <T text={"template siap pakai. Pilih. Isi. Unduh. Mudah. "} />{plus ? "Paket Plus aktif: tanpa batas." : "Paket Basic: 2 CV tersimpan."}</>}
              align="center"
              titleClassName="max-w-[820px]"
              descriptionClassName="max-w-[660px]"
            /></LocalizedAttributes>
            <LocalizedAttributes><FilterTabs<KindFilter>
              className="relative z-10 mt-8"
              label="Saring jenis template"
              options={[{ value: "semua", label: "Semua template" }, { value: "ats", label: "ATS Friendly" }, { value: "kreatif", label: "Kreatif" }]}
              value={kind}
              onChange={(next) => { setKind(next); setPage(0); }}
            /></LocalizedAttributes>
            <div className="relative mt-6 w-full">
              <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-100px] h-[1400px] w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,black_12%,black_88%,transparent_100%)]">
                <div className="absolute -left-24 top-6 h-[13rem] w-[19rem] rotate-12 rounded-[58%_42%_55%_45%/50%_58%_42%_50%] bg-pink-300/70 blur-3xl" />
                <div className="absolute left-[22%] top-[-30px] h-[34rem] w-[30rem] -rotate-6 rounded-[42%_58%_37%_63%/55%_45%_55%_45%] bg-yellow-200/70 blur-3xl" />
                <div className="absolute left-[44%] top-16 h-[11rem] w-[11rem] rotate-45 rounded-[63%_37%_54%_46%/55%_48%_52%_45%] bg-blue-300/70 blur-3xl" />
                <div className="absolute right-[4%] top-10 h-[24rem] w-[17rem] -rotate-12 rounded-[37%_63%_46%_54%/60%_40%_60%_40%] bg-green-200/70 blur-3xl" />
                <div className="absolute left-[33%] top-[210px] h-[26rem] w-[32rem] rotate-6 rounded-[55%_45%_60%_40%/42%_60%_40%_58%] bg-purple-300/60 blur-3xl" />
                <div className="absolute left-[58%] top-[300px] h-[12rem] w-[20rem] -rotate-45 rounded-[46%_54%_38%_62%/58%_42%_58%_42%] bg-rose-200/70 blur-3xl" />
                <div className="absolute left-[6%] top-[420px] h-[28rem] w-[22rem] rotate-12 rounded-[60%_40%_45%_55%/45%_55%_45%_55%] bg-orange-200/60 blur-3xl" />
                <div className="absolute left-[40%] top-[520px] h-[36rem] w-[36rem] -rotate-3 rounded-[45%_55%_52%_48%/52%_44%_56%_48%] bg-blue-300/70 blur-3xl" />
                <div className="absolute right-[10%] top-[560px] h-[10rem] w-[14rem] rotate-45 rounded-[38%_62%_55%_45%/62%_38%_62%_38%] bg-yellow-200/70 blur-3xl" />
                <div className="absolute bottom-10 left-[18%] h-[16rem] w-[26rem] -rotate-12 rounded-[52%_48%_40%_60%/48%_60%_40%_52%] bg-green-200/70 blur-3xl" />
                <div className="absolute -bottom-10 left-[52%] h-[14rem] w-[14rem] rotate-12 rounded-[60%_40%_62%_38%/40%_62%_38%_60%] bg-pink-300/60 blur-3xl" />
              </div>
              <div id="pilih" className="relative z-10 grid w-full scroll-mt-28 grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
              {visibleTpl.map((t) => {
                const lockedTpl = t.plusOnly && !plus;
                return (
                  <LocalizedAttributes key={t.id}><button
                    key={t.id}
                    type="button"
                    onClick={() => choose(t.id)}
                    aria-label={t.plusOnly ? `${t.name}, template Plus${lockedTpl ? ", upgrade untuk memakai" : ", pakai template"}` : `Pakai template ${t.name}`}
                    className="group relative flex flex-col rounded-2xl border border-white bg-white/30 p-3 text-left backdrop-blur transition-shadow hover:shadow-lg"
                  >
                    <div data-document-preview className="aspect-[210/297] overflow-hidden rounded-xl bg-white" aria-hidden="true">
                      {t.id === "professional" ? <ProfessionalPreview /> : <div className="pointer-events-none flex min-h-[200%] origin-top-left select-none flex-col" style={{ width: "200%", transform: "scale(0.5)" }}>
                        <CvSheet data={{ ...DEFAULT_CV, templateId: t.id }} watermark={false} fill />
                      </div>}
                    </div>
                    {t.plusOnly && (
                      <LocalizedAttributes><span title="Template Plus" className="absolute right-5 top-5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#2c2c2c] text-[#ffd200] shadow-sm">
                        <FaCrown aria-hidden="true" className="h-3 w-3" />
                        <span className="sr-only"><T text={"Template Plus"} /></span>
                      </span></LocalizedAttributes>
                    )}
                    <p className="px-2 pb-2 pt-3 text-lg font-bold">{t.name}</p>
                  </button></LocalizedAttributes>
                );
              })}
            </div>
            {pageCount > 1 && (
              <LocalizedAttributes><div className="relative mt-6 flex justify-center gap-2" role="navigation" aria-label="Halaman template">
                {Array.from({ length: pageCount }, (_, i) => (
                  <LocalizedAttributes key={i}><button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-label={`Halaman ${i + 1}`}
                    aria-current={page === i ? "page" : undefined}
                    className={`h-9 w-9 rounded-full text-sm font-bold transition-colors ${
                      page === i ? "bg-black text-white" : "border border-black bg-transparent text-black hover:bg-black/5"
                    }`}
                  >
                    {i + 1}
                  </button></LocalizedAttributes>
                ))}
              </div></LocalizedAttributes>
            )}
            <div id="catatan" className="relative mt-8 flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#ffd200] p-6 text-center sm:flex-row sm:gap-4" role="note">
              <p className="text-[17px] font-medium leading-snug text-black">
                <strong className="font-bold"><T text={"Mau semua template terbuka?"} /></strong>{" "}
                <T text={"Upgrade ke Plus ("} /><T text={PLUS_PRICE} /><T text={") untuk template premium dan unduhan tanpa cap."} />{" "}
                <Link href="/harga" className="underline underline-offset-2"><T text={"Harga awal."} /></Link>
              </p>
              <a href={wa(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE}`)} className="inline-flex shrink-0 items-center rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800">
                <T text={"Upgrade ke Plus "} /></a>
            </div>
            </div>
          </div>
        </section>
        {children}
      </main>

      <div className="no-print">
        <SiteFooter variant="light" />
      </div>
    </div>
  );
}
