"use client";

import { sections, type CellValue } from "../data/features";

function Cell({ value, label }: { value: CellValue; label: string }) {
  if (value === true)
    return (
      <span>
        <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-li-green text-sm font-bold text-white">✓</span>
        <span className="sr-only">{label}: termasuk</span>
      </span>
    );
  if (value === false)
    return (
      <span>
        <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-li-muted">–</span>
        <span className="sr-only">{label}: tidak termasuk</span>
      </span>
    );
  return <span className="font-semibold text-li-text">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          aria-label={`Perbandingan ${s.title}`}
          className="overflow-hidden rounded-lg border border-white/10 bg-li-card"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <h3 className="text-base font-bold text-li-text">{s.title}</h3>
            <span className="font-mono text-xs text-li-muted">0{i + 1}</span>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-li-muted">
                  <th scope="col" className="w-[50%] px-5 py-3">Fitur</th>
                  <th scope="col" className="w-[25%] px-5 py-3 text-center">
                    Basic
                    <span className="block font-normal normal-case text-li-muted">gratis</span>
                  </th>
                  <th scope="col" className="w-[25%] bg-li-blue/10 px-5 py-3 text-center text-li-link">
                    Plus
                    <span className="block font-normal normal-case text-li-muted">berbayar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.fitur} className="border-b border-white/10 last:border-0">
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-li-text">{r.fitur}</div>
                      <div className="mt-1 text-li-muted">{r.deskripsi}</div>
                      {r.paywallMoment && (
                        <div className="mt-1 text-xs text-li-gold">
                          Perlu Plus saat: {r.paywallMoment}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center align-top">
                      <Cell value={r.basic} label="Basic" />
                    </td>
                    <td className="bg-li-blue/[0.07] px-5 py-4 text-center align-top">
                      <Cell value={r.plus} label="Plus" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/10 md:hidden">
            {s.rows.map((r) => (
              <div key={r.fitur} className="px-4 py-4">
                <div className="font-semibold text-li-text">{r.fitur}</div>
                <p className="mt-1 text-sm text-li-muted">{r.deskripsi}</p>
                {r.paywallMoment && (
                  <p className="mt-1 text-xs text-li-gold">Perlu Plus saat: {r.paywallMoment}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-white/10 px-3 py-2 text-center">
                    <div className="text-xs uppercase text-li-muted">Basic</div>
                    <div className="mt-1 flex justify-center">
                      <Cell value={r.basic} label="Basic" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-li-blue/40 bg-li-blue/10 px-3 py-2 text-center">
                    <div className="text-xs uppercase text-li-link">Plus</div>
                    <div className="mt-1 flex justify-center">
                      <Cell value={r.plus} label="Plus" />
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
