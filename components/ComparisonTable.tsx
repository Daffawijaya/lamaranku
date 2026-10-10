"use client";

import { Check, Minus } from "lucide-react";
import { sections, type CellValue } from "../data/features";

function Cell({ value, label }: { value: CellValue; label: string }) {
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
        <Minus aria-hidden="true" className="h-5 w-5 text-zinc-400" strokeWidth={2.5} />
        <span className="sr-only">{label}: tidak termasuk</span>
      </span>
    );
  return <span className="font-semibold">{value}</span>;
}

export default function ComparisonTable() {
  return (
    <div className="space-y-12">
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-label={`Perbandingan ${s.title}`}>
          <h3 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{s.title}</h3>

          <div className="hidden overflow-hidden rounded-none border border-[#dadada] bg-white lg:block">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">
                Perbandingan paket Basic dan Plus untuk {s.title}
              </caption>
              <thead>
                <tr className="text-sm font-bold text-[#2c2c2c]">
                  <th scope="col" className="w-[46%] bg-[#f8f8f8] px-7 py-5">
                    Fitur
                  </th>
                  <th scope="col" className="w-[27%] border-l border-[#dadada] px-7 py-5">
                    Basic
                    <span className="block text-xs font-normal text-black/55">gratis</span>
                  </th>
                  <th scope="col" className="w-[27%] border-l border-[#dadada] bg-[#2c2c2c] px-7 py-5 text-white">
                    Plus
                    <span className="block text-xs font-normal text-white/60">berbayar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.fitur} className="group border-t border-[#dadada] align-middle">
                    <th scope="row" className="bg-[#f8f8f8] px-7 py-6 font-normal align-top">
                      <span className="block text-base font-bold leading-snug text-[#2c2c2c]">
                        {r.fitur}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-black/70">
                        {r.deskripsi}
                      </span>
                      {r.paywallMoment && (
                        <span className="mt-1 block text-xs font-semibold text-black/55">
                          Perlu Plus saat: {r.paywallMoment}
                        </span>
                      )}
                    </th>
                    <td className="border-l border-[#dadada] px-7 py-6 text-center align-top text-[#2c2c2c]">
                      <Cell value={r.basic} label="Basic" />
                    </td>
                    <td className="border-l border-[#dadada] bg-[#2c2c2c] px-7 py-6 text-center align-top text-white">
                      <Cell value={r.plus} label="Plus" />
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
                  <h4 className="text-lg font-bold leading-snug">{r.fitur}</h4>
                  <p className="mt-1 text-sm text-black/70">{r.deskripsi}</p>
                  {r.paywallMoment && (
                    <p className="mt-1 text-xs font-semibold text-black/55">Perlu Plus saat: {r.paywallMoment}</p>
                  )}
                </div>
                <dl className="divide-y divide-[#dadada] border-y border-[#dadada]">
                  <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-5">
                    <dt className="text-sm font-bold text-[#2c2c2c]">Basic</dt>
                    <dd className="text-sm leading-6 text-black/70"><Cell value={r.basic} label="Basic" /></dd>
                  </div>
                  <div className="grid gap-1 bg-[#2c2c2c] px-5 py-4 text-white sm:grid-cols-[180px_1fr] sm:gap-5">
                    <dt className="text-sm font-bold">Plus</dt>
                    <dd className="text-sm leading-6"><Cell value={r.plus} label="Plus" /></dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
