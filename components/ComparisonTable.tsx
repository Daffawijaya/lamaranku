"use client";

import { Check, Minus } from "lucide-react";
import { sections, type CellValue } from "../data/features";

function Cell({ value, label, dark = false }: { value: CellValue; label: string; dark?: boolean }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center">
        <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
        <span className="sr-only">{label}: termasuk</span>
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center">
        <Minus aria-hidden="true" className={`h-5 w-5 ${dark ? "text-white/50" : "text-zinc-400"}`} strokeWidth={2.5} />
        <span className="sr-only">{label}: tidak termasuk</span>
      </span>
    );
  return <span className="font-semibold">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-label={`Perbandingan ${s.title}`}>
          <h3 className="mb-4 text-xl font-bold text-zinc-900 sm:text-2xl">{s.title}</h3>

          <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left">
                  <th scope="col" className="w-[50%] px-6 py-4 font-bold text-zinc-900">Fitur</th>
                  <th scope="col" className="w-[25%] px-6 py-4 text-center">
                    <span className="block font-bold text-zinc-900">Basic</span>
                    <span className="text-xs font-normal text-zinc-500">gratis</span>
                  </th>
                  <th scope="col" className="w-[25%] bg-zinc-900 px-6 py-4 text-center">
                    <span className="block font-bold text-white">Plus</span>
                    <span className="text-xs font-normal text-white/60">berbayar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.fitur} className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-zinc-900">{r.fitur}</div>
                      <div className="mt-1 text-zinc-600">{r.deskripsi}</div>
                      {r.paywallMoment && (
                        <div className="mt-1 text-xs font-semibold text-zinc-500">Perlu Plus saat: {r.paywallMoment}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center align-top text-zinc-900">
                      <Cell value={r.basic} label="Basic" />
                    </td>
                    <td className="bg-zinc-900 px-6 py-4 text-center align-top text-white">
                      <Cell value={r.plus} label="Plus" dark />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {s.rows.map((r) => (
              <div key={r.fitur} className="rounded-2xl bg-zinc-100 p-4">
                <div className="font-bold text-zinc-900">{r.fitur}</div>
                <p className="mt-1 text-sm text-zinc-600">{r.deskripsi}</p>
                {r.paywallMoment && (
                  <p className="mt-1 text-xs font-semibold text-zinc-500">Perlu Plus saat: {r.paywallMoment}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-white px-3 py-2 text-center">
                    <div className="text-xs font-semibold uppercase text-zinc-500">Basic</div>
                    <div className="mt-1 flex justify-center text-zinc-900">
                      <Cell value={r.basic} label="Basic" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-900 px-3 py-2 text-center text-white">
                    <div className="text-xs font-semibold uppercase text-white/60">Plus</div>
                    <div className="mt-1 flex justify-center">
                      <Cell value={r.plus} label="Plus" dark />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
