"use client";

import { useState } from "react";
import { TEMPLATES, templateById, type TemplateKind } from "../../data/templates";

type Filter = "semua" | TemplateKind;

export function MiniPreview({ id, kind, h = "h-44" }: { id: string; kind: TemplateKind; h?: string }) {
  if (kind === "ats") {
    return (
      <div className={`flex ${h} flex-col gap-1.5 bg-white p-3`} aria-hidden="true">
        <div className="mx-auto h-3 w-2/3 bg-ink" />
        <div className="mx-auto h-1.5 w-1/2 bg-muted/60" />
        <div className="mx-auto h-px w-full bg-ink/30" />
        <div className="h-1.5 w-full bg-ink/15" />
        <div className="h-1.5 w-full bg-ink/15" />
        <div className="h-1.5 w-5/6 bg-ink/15" />
        <div className="mt-1 h-1.5 w-1/3 bg-materai/50" />
        <div className="h-1.5 w-full bg-ink/15" />
        <div className="h-1.5 w-4/6 bg-ink/15" />
        <span className="sr-only">Pratinjau sketsa {id}</span>
      </div>
    );
  }
  return (
    <div className={`flex ${h} gap-0 bg-white`} aria-hidden="true">
      <div className="flex w-1/3 flex-col items-center gap-1.5 bg-materai p-2">
        <div className="h-8 w-8 rounded-full border-2 border-white" />
        <div className="h-1.5 w-4/5 bg-white/70" />
        <div className="h-1.5 w-3/5 bg-white/50" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="h-2.5 w-2/3 bg-ink" />
        <div className="h-1.5 w-1/2 bg-materai/50" />
        <div className="h-1.5 w-full bg-ink/15" />
        <div className="h-1.5 w-full bg-ink/15" />
        <div className="h-1.5 w-5/6 bg-ink/15" />
      </div>
      <span className="sr-only">Pratinjau sketsa {id}</span>
    </div>
  );
}

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

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Saring jenis template">
        {(["semua", "ats", "kreatif"] as Filter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`inline-flex min-h-[44px] items-center rounded-lg px-4 py-2 text-sm font-semibold ${
              filter === f ? "bg-ink text-white" : "border border-ink/25 bg-white"
            }`}
          >
            {f === "semua" ? `Semua (${TEMPLATES.length})` : f === "ats" ? "ATS Friendly" : "Kreatif"}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const active = t.id === activeId;
          return (
            <li
              key={t.id}
              className={`overflow-hidden rounded-[10px] border bg-white ${active ? "border-materai ring-2 ring-materai/40" : "border-ink/20"}`}
            >
              <MiniPreview id={t.id} kind={t.kind} />
              <div className="border-t border-ink/15 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg font-bold">{t.name}</p>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${t.kind === "ats" ? "bg-ink text-paper" : "bg-materai text-white"}`}>
                    {t.kind === "ats" ? "ATS" : "KREATIF"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{t.desc}</p>
                {t.plusOnly && (
                  <p className="mt-1 text-xs font-semibold text-stamp">Template Plus</p>
                )}
                <button
                  onClick={() => (templateById(t.id).plusOnly ? lockedNote(t) : onPick(t.id))}
                  aria-pressed={active}
                  className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${
                    active ? "bg-materai text-white" : "border border-ink/25 bg-white"
                  }`}
                >
                  {active ? "Dipakai" : `Pakai ${t.name}`}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
