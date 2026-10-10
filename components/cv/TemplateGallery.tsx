"use client";

import { useState } from "react";
import { TEMPLATES, templateById, type TemplateKind } from "../../data/templates";

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
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#dadada] bg-white">
        <div className="mx-auto w-full max-w-[1310px] px-2 sm:px-4 lg:px-6">
          <div className="-mb-px flex overflow-x-auto sm:justify-center" role="tablist" aria-label="Saring jenis template">
            {TABS.map((tab) => {
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(tab.key)}
                  className={`relative shrink-0 px-5 py-4 text-sm font-bold transition-colors sm:px-7 ${
                    isActive ? "text-[#2c2c2c]" : "text-black/55 hover:text-[#2c2c2c]"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-[#3b63fb] transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-none border border-[#dadada] bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            Daftar template CV beserta jenis dan tombol pakai
          </caption>
          <thead>
            <tr className="text-sm font-bold text-[#2c2c2c]">
              <th scope="col" className="w-[46%] bg-[#f8f8f8] px-7 py-5">
                Template
              </th>
              <th scope="col" className="w-[27%] border-l border-[#dadada] px-7 py-5">
                Jenis
              </th>
              <th scope="col" className="w-[27%] border-l border-[#dadada] px-6 py-5 text-center">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const active = t.id === activeId;
              const locked = t.plusOnly;
              return (
                <tr key={t.id} className="group border-t border-[#dadada] align-middle">
                  <th scope="row" className="bg-[#f8f8f8] px-7 py-6 font-normal">
                    <span className="block text-xs font-bold uppercase tracking-[0.12em] text-black/50">
                      {t.kind === "ats" ? "ATS Friendly" : "Kreatif"}{locked ? " • Plus" : ""}
                    </span>
                    <span className="mt-2 block text-lg font-bold leading-snug text-[#2c2c2c]">
                      {t.name}
                      {active && <span className="ml-2 text-sm font-semibold text-[#3b63fb]">Dipakai</span>}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-black/70">
                      {t.desc}
                    </span>
                  </th>
                  <td className="border-l border-[#dadada] px-7 py-6 text-[0.9375rem] font-semibold leading-6 text-[#2c2c2c]">
                    {t.kind === "ats" ? "Satu kolom teks" : "Visual kreatif"}
                  </td>
                  <td className="border-l border-[#dadada] px-5 py-6 text-center">
                    <button
                      type="button"
                      onClick={() => choose(t.id)}
                      aria-pressed={active}
                      aria-label={locked ? `${t.name}, khusus Plus` : `Pakai template ${t.name}`}
                      className="inline-flex min-w-24 items-center justify-center rounded-full bg-[#3b63fb] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b63fb] focus-visible:ring-offset-2"
                    >
                      {locked ? "Plus" : active ? "Dipakai" : "Pakai"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 lg:hidden">
        {list.map((t) => {
          const active = t.id === activeId;
          const locked = t.plusOnly;
          return (
            <article key={t.id} className="overflow-hidden rounded-2xl border border-[#dadada] bg-white">
              <div className="bg-[#f8f8f8] px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/50">
                  {t.kind === "ats" ? "ATS Friendly" : "Kreatif"}{locked ? " • Plus" : ""}
                </p>
                <h3 className="mt-2 text-xl font-bold leading-snug">
                  {t.name}
                  {active && <span className="ml-2 text-sm font-semibold text-[#3b63fb]">Dipakai</span>}
                </h3>
                <p className="mt-1 text-sm text-black/70">{t.desc}</p>
              </div>
              <div className="p-5">
                <button
                  type="button"
                  onClick={() => choose(t.id)}
                  aria-pressed={active}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#3b63fb] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#274dea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b63fb] focus-visible:ring-offset-2 sm:w-auto"
                >
                  {locked ? "Khusus Plus" : active ? "Dipakai" : `Pakai ${t.name}`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
