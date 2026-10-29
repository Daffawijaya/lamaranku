"use client";

import { T, LocalizedAttributes } from "./i18n/LanguageProvider";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { sections, type CellValue } from "../data/features";

function Cell({ value, label }: { value: CellValue; label: string }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center">
        <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
        <span className="sr-only"><T text={label} /><T text={": termasuk"} /></span>
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center">
        <Minus aria-hidden="true" className="h-5 w-5 text-black/30" strokeWidth={2.5} />
        <span className="sr-only"><T text={label} /><T text={": tidak termasuk"} /></span>
      </span>
    );
  return <span className="font-semibold"><T text={value} /></span>;
}

type Filter = "semua" | string;

const titleById: Record<string, string> = Object.fromEntries(sections.map((s) => [s.id, s.title]));

export default function ComparisonTable({ showPaywallMoment = true }: { showPaywallMoment?: boolean }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const list = sections.filter((s) => filter === "semua" || s.id === filter);

  return (
    <div>
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-[#dadada] bg-white">
        <div className="mx-auto w-full max-w-[1310px] px-2 sm:px-4 lg:px-6">
          <LocalizedAttributes><div className="-mb-px flex overflow-x-auto sm:justify-center" role="group" aria-label="Saring grup fitur">
            {(["semua", ...sections.map((s) => s.id)] as Filter[]).map((f) => {
              const isActive = filter === f;
              const label = f === "semua" ? "Semua paket" : titleById[f] ?? f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setFilter(f)}
                  className={`relative shrink-0 px-5 py-4 text-sm font-bold transition-colors sm:px-7 ${
                    isActive ? "text-[#2c2c2c]" : "text-black/55 hover:text-[#2c2c2c]"
                  }`}
                >
                  <T text={label} />
                  <span
                    className={`absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-[#3b63fb] transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div></LocalizedAttributes>
        </div>
      </div>

      <div className="mt-8 space-y-12">
        {list.map((s) => (
          <LocalizedAttributes key={s.id}><section key={s.id} id={s.id} aria-label={`Perbandingan ${s.title}`}>
            <h3 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl"><T text={s.title} /></h3>

            <div className="hidden overflow-hidden rounded-none border border-[#dadada] bg-white lg:block">
              <table className="w-full table-fixed border-collapse text-left">
                <caption className="sr-only">
                  <T text={"Perbandingan paket Basic dan Plus untuk "} /><T text={s.title} />
                </caption>
                <thead>
                  <tr className="text-sm font-bold text-[#2c2c2c]">
                    <th scope="col" className="w-[46%] bg-[#f8f8f8] px-7 py-5">
                      <T text={"Fitur "} /></th>
                    <th scope="col" className="w-[27%] border-l border-[#dadada] px-7 py-5">
                      <T text={"Basic "} /></th>
                    <th scope="col" className="w-[27%] border-l border-[#dadada] px-7 py-5">
                      <T text={"Plus "} /></th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map((r) => (
                    <tr key={r.fitur} className="group border-t border-[#dadada] align-middle">
                      <th scope="row" className="bg-[#f8f8f8] px-7 py-6 font-normal align-middle">
                        <span className="block text-base font-bold leading-snug text-[#2c2c2c]">
                          <T text={r.fitur} />
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-black/70">
                          <T text={r.deskripsi} />
                        </span>
                        {showPaywallMoment && r.paywallMoment && (
                          <span className="mt-1 block text-xs font-semibold text-black/55">
                            <T text={"Perlu Plus saat: "} /><T text={r.paywallMoment} />
                          </span>
                        )}
                      </th>
                      <td className="border-l border-[#dadada] px-7 py-6 text-center align-middle text-[0.9375rem] font-semibold leading-6 text-[#2c2c2c]">
                        <LocalizedAttributes><Cell value={r.basic} label="Basic" /></LocalizedAttributes>
                      </td>
                      <td className="border-l border-[#dadada] px-7 py-6 text-center align-middle text-[0.9375rem] leading-6 text-black/70">
                        <LocalizedAttributes><Cell value={r.plus} label="Plus" /></LocalizedAttributes>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 lg:hidden">
              {s.rows.map((r) => (
                <article key={r.fitur} className="overflow-hidden rounded-2xl border border-[#dadada] bg-white">
                  <div className="bg-[#f8f8f8] px-5 py-5">
                    <h4 className="text-lg font-bold leading-snug"><T text={r.fitur} /></h4>
                    <p className="mt-1 text-sm text-black/70"><T text={r.deskripsi} /></p>
                    {showPaywallMoment && r.paywallMoment && (
                      <p className="mt-1 text-xs font-semibold text-black/55"><T text={"Perlu Plus saat: "} /><T text={r.paywallMoment} /></p>
                    )}
                  </div>
                  <dl className="divide-y divide-[#dadada] border-y border-[#dadada]">
                    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
                      <dt className="text-sm font-bold text-[#2c2c2c]"><T text={"Basic"} /></dt>
                      <dd className="text-sm leading-6 text-black/70"><LocalizedAttributes><Cell value={r.basic} label="Basic" /></LocalizedAttributes></dd>
                    </div>
                    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
                      <dt className="text-sm font-bold text-[#2c2c2c]"><T text={"Plus"} /></dt>
                      <dd className="text-sm leading-6 text-black/70"><LocalizedAttributes><Cell value={r.plus} label="Plus" /></LocalizedAttributes></dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section></LocalizedAttributes>
        ))}
      </div>
    </div>
  );
}
