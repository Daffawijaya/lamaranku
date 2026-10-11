"use client";

import { useState } from "react";
import { TEMPLATES, templateById, type TemplateKind } from "../../data/templates";
import { DEFAULT_CV } from "../../lib/cv";
import CvSheet from "./CvSheet";

type Filter = "semua" | TemplateKind;

const TABS: { key: Filter; label: string }[] = [
  { key: "semua", label: "Semua template" },
  { key: "ats", label: "ATS Friendly" },
  { key: "kreatif", label: "Kreatif" },
];

export default function TemplateGallery({
  activeId,
  initialFilter = "semua",
  onPick,
  lockedNote
}: {
  activeId: string;
  initialFilter?: Filter;
  onPick: (id: string) => void;
  lockedNote: (t: { id: string; name: string }) => void;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const list = TEMPLATES.filter((t) => filter === "semua" || t.kind === filter);

  const choose = (id: string) => {
    if (templateById(id).plusOnly) {
      const t = templateById(id);
      lockedNote(t);
    } else {
      onPick(id);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Saring jenis template">
        {TABS.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                isActive ? "bg-[#1473e6] text-white" : "bg-[#f0f0f0] text-black hover:bg-[#e2e2e2]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((t) => {
          const active = t.id === activeId;
          const locked = t.plusOnly;
          return (
            <article
              key={t.id}
              className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
                active ? "border-[#3b63fb] ring-2 ring-[#3b63fb]/40" : "border-[#dadada]"
              }`}
            >
              <button
                type="button"
                onClick={() => choose(t.id)}
                aria-pressed={active}
                aria-label={locked ? `${t.name}, khusus Plus` : `Pakai template ${t.name}`}
                className="relative block w-full text-left"
              >
                <div className="h-64 overflow-hidden bg-[#f8f8f8]" aria-hidden="true">
                  {/* Preview live: render template asli diperkecil (lebar 166% x skala 0.6 = pas kartu) */}
                  <div className="pointer-events-none origin-top-left select-none" style={{ width: "166.67%", transform: "scale(0.6)" }}>
                    <CvSheet data={{ ...DEFAULT_CV, templateId: t.id }} watermark={false} />
                  </div>
                </div>
                {locked && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#2c2c2c] px-3 py-1 text-xs font-bold text-white">
                    Plus
                  </span>
                )}
                {active && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#3b63fb] px-3 py-1 text-xs font-bold text-white">
                    Dipakai
                  </span>
                )}
              </button>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/50">
                  {t.kind === "ats" ? "ATS Friendly" : "Kreatif"}
                </p>
                <h3 className="mt-1 text-xl font-bold leading-snug">{t.name}</h3>
                <p className="mt-1 text-sm leading-6 text-black/70">{t.desc}</p>
                <div className="mt-auto pt-3">
                  <button
                    type="button"
                    onClick={() => choose(t.id)}
                    aria-pressed={active}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#3b63fb] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b63fb] focus-visible:ring-offset-2"
                  >
                    {locked ? "Khusus Plus" : active ? "Dipakai" : `Pakai ${t.name}`}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
