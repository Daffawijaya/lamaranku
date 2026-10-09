"use client";

import type { ReactNode } from "react";
import type { CvData } from "../../lib/cv";

function Contact({ d, sep = " | " }: { d: CvData; sep?: string }) {
  return (
    <p>
      {[d.email, d.telepon, d.alamat].filter((x) => x.trim() !== "").join(sep)}
    </p>
  );
}

function ExpList({ d, titleClass = "mt-4 font-bold" }: { d: CvData; titleClass?: string }) {
  if (d.pengalaman.length === 0) return null;
  return (
    <div>
      <h3 className={titleClass}>Pengalaman Kerja</h3>
      {d.pengalaman.map((p, i) => (
        <div key={i} className="mt-2">
          <p className="font-bold">
            {p.jabatan || "(jabatan)"} <span className="font-normal">di {p.perusahaan || "(perusahaan)"}</span>
          </p>
          <p className="text-xs opacity-70">{p.periode}</p>
          <p className="mt-1">{p.deskripsi}</p>
        </div>
      ))}
    </div>
  );
}

function EduList({ d, titleClass = "mt-4 font-bold" }: { d: CvData; titleClass?: string }) {
  if (d.pendidikan.length === 0) return null;
  return (
    <div>
      <h3 className={titleClass}>Pendidikan</h3>
      {d.pendidikan.map((p, i) => (
        <p key={i} className="mt-1">
          <span className="font-bold">{p.gelar || "(gelar)"}</span>, {p.sekolah} ({p.tahun})
        </p>
      ))}
    </div>
  );
}

function Skills({ d, titleClass = "mt-4 font-bold" }: { d: CvData; titleClass?: string }) {
  if (d.keahlian.trim() === "") return null;
  return (
    <div>
      <h3 className={titleClass}>Keahlian</h3>
      <p className="mt-1">{d.keahlian}</p>
    </div>
  );
}

function Harvard({ d }: { d: CvData }) {
  return (
    <div className="font-display text-[13px] leading-relaxed text-ink">
      <h2 className="text-center text-2xl font-bold">{d.nama || "(nama)"}</h2>
      <p className="mt-1 text-center text-sm font-semibold">{d.posisi}</p>
      <div className="mt-1 text-center text-xs"><Contact d={d} /></div>
      <hr className="my-3 border-t-2 border-ink" />
      <h3 className="text-center font-bold tracking-wide">RINGKASAN</h3>
      <p className="mt-1 text-justify">{d.ringkasan}</p>
      <hr className="my-3 border-t border-ink/40" />
      <ExpList d={d} titleClass="text-center font-bold tracking-wide" />
      <hr className="my-3 border-t border-ink/40" />
      <EduList d={d} titleClass="text-center font-bold tracking-wide" />
      <Skills d={d} titleClass="mt-3 text-center font-bold tracking-wide" />
    </div>
  );
}

function Adelaide({ d }: { d: CvData }) {
  const h = "mt-4 border-b-2 border-ink pb-1 font-bold";
  return (
    <div className="text-[13px] leading-relaxed text-ink">
      <h2 className="text-3xl font-extrabold">{d.nama || "(nama)"}</h2>
      <p className="font-semibold text-materai">{d.posisi}</p>
      <div className="mt-1 text-xs"><Contact d={d} sep="  •  " /></div>
      <h3 className={h}>Ringkasan</h3>
      <p className="mt-1">{d.ringkasan}</p>
      <ExpList d={d} titleClass={h} />
      <EduList d={d} titleClass={h} />
      <Skills d={d} titleClass={h} />
    </div>
  );
}

function Structura({ d }: { d: CvData }) {
  return (
    <div className="text-[12.5px] leading-snug text-ink">
      <h2 className="text-xl font-bold">{d.nama || "(nama)"} <span className="font-normal">- {d.posisi}</span></h2>
      <div className="text-xs"><Contact d={d} /></div>
      <p className="mt-2"><span className="font-bold">Ringkasan: </span>{d.ringkasan}</p>
      {d.pengalaman.map((p, i) => (
        <p key={i} className="mt-2">
          <span className="font-bold">{p.jabatan}</span> | {p.perusahaan} | {p.periode}. {p.deskripsi}
        </p>
      ))}
      {d.pendidikan.map((p, i) => (
        <p key={i} className="mt-1"><span className="font-bold">Pendidikan: </span>{p.gelar}, {p.sekolah} ({p.tahun})</p>
      ))}
      {d.keahlian.trim() !== "" && <p className="mt-1"><span className="font-bold">Keahlian: </span>{d.keahlian}</p>}
    </div>
  );
}

function Columbia({ d }: { d: CvData }) {
  return (
    <div className="text-[13px] leading-relaxed text-ink">
      <h2 className="text-4xl font-black leading-none">{d.nama || "(nama)"}</h2>
      <p className="mt-1 text-base font-semibold">{d.posisi}</p>
      <div className="mt-1 text-xs"><Contact d={d} sep="   " /></div>
      <hr className="my-3 border-t border-ink" />
      <p className="italic">{d.ringkasan}</p>
      {d.pengalaman.map((p, i) => (
        <div key={i} className="mt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-bold">{p.jabatan} - {p.perusahaan}</p>
            <p className="shrink-0 text-xs">{p.periode}</p>
          </div>
          <p className="mt-1">{p.deskripsi}</p>
        </div>
      ))}
      <EduList d={d} />
      <Skills d={d} />
    </div>
  );
}

function Munich({ d }: { d: CvData }) {
  const h = "mt-6 text-xs font-bold uppercase tracking-widest text-muted";
  return (
    <div className="px-2 text-[13px] leading-loose text-ink">
      <h2 className="text-2xl font-light">{d.nama || "(nama)"}</h2>
      <p className="text-sm">{d.posisi}</p>
      <div className="mt-1 text-xs text-muted"><Contact d={d} sep=" · " /></div>
      <hr className="my-4 border-t border-ink/20" />
      <h3 className={h}>Ringkasan</h3>
      <p className="mt-1">{d.ringkasan}</p>
      <ExpList d={d} titleClass={h} />
      <EduList d={d} titleClass={h} />
      <Skills d={d} titleClass={h} />
    </div>
  );
}

function Oxford({ d }: { d: CvData }) {
  return (
    <div className="font-display text-[13px] leading-relaxed text-ink">
      <h2 className="text-center text-2xl font-bold underline underline-offset-4">{d.nama || "(nama)"}</h2>
      <p className="mt-1 text-center italic">{d.posisi}</p>
      <div className="mt-1 text-center text-xs"><Contact d={d} /></div>
      <h3 className="mt-4 font-bold">I. Ringkasan</h3>
      <p className="mt-1">{d.ringkasan}</p>
      <h3 className="mt-3 font-bold">II. Pengalaman</h3>
      {d.pengalaman.map((p, i) => (
        <p key={i} className="mt-1">{p.periode}: <span className="font-bold">{p.jabatan}</span>, <span className="italic">{p.perusahaan}</span>. {p.deskripsi}</p>
      ))}
      <h3 className="mt-3 font-bold">III. Pendidikan</h3>
      {d.pendidikan.map((p, i) => (
        <p key={i} className="mt-1">{p.tahun}: <span className="font-bold">{p.gelar}</span>, <span className="italic">{p.sekolah}</span></p>
      ))}
      {d.keahlian.trim() !== "" && (<><h3 className="mt-3 font-bold">IV. Keahlian</h3><p className="mt-1">{d.keahlian}</p></>)}
    </div>
  );
}

function SideShell({ d, children, side }: { d: CvData; children: ReactNode; side: ReactNode }) {
  const initial = (d.nama.trim()[0] || "?").toUpperCase();
  return (
    <div className="flex gap-0 overflow-hidden rounded-sm text-[12.5px] leading-relaxed">
      <div className="w-40 shrink-0 bg-materai p-4 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white font-display text-2xl font-bold" aria-hidden="true">{initial}</div>
        <p className="mt-3 font-bold">Kontak</p>
        <div className="mt-1 space-y-1 text-[11px]">{[d.email, d.telepon, d.alamat].filter((x) => x.trim() !== "").map((x) => <p key={x}>{x}</p>)}</div>
        {d.keahlian.trim() !== "" && (<><p className="mt-4 font-bold">Keahlian</p><p className="mt-1 text-[11px]">{d.keahlian}</p></>)}
        {side}
      </div>
      <div className="flex-1 p-4 text-ink">{children}</div>
    </div>
  );
}

function Minimalist({ d }: { d: CvData }) {
  return (
    <SideShell d={d} side={null}>
      <h2 className="text-2xl font-extrabold">{d.nama || "(nama)"}</h2>
      <p className="font-semibold text-materai">{d.posisi}</p>
      <p className="mt-2">{d.ringkasan}</p>
      <ExpList d={d} />
      <EduList d={d} />
    </SideShell>
  );
}

function Corporate({ d }: { d: CvData }) {
  return (
    <div className="overflow-hidden rounded-sm text-[12.5px] leading-relaxed">
      <div className="bg-ink p-4 text-paper">
        <h2 className="text-2xl font-bold">{d.nama || "(nama)"}</h2>
        <p className="text-sm">{d.posisi}</p>
        <div className="mt-1 text-[11px] opacity-80"><Contact d={d} sep="  •  " /></div>
      </div>
      <div className="flex gap-4 p-4 text-ink">
        <div className="flex-1">
          <p>{d.ringkasan}</p>
          <ExpList d={d} />
        </div>
        <div className="w-36 shrink-0">
          <EduList d={d} />
          <Skills d={d} />
        </div>
      </div>
    </div>
  );
}

function BoldImpact({ d }: { d: CvData }) {
  const tags = d.keahlian.split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="border-l-8 border-stamp pl-4 text-[13px] leading-relaxed text-ink">
      <h2 className="text-4xl font-black uppercase">{d.nama || "(nama)"}</h2>
      <p className="mt-1 inline-block bg-stamp px-2 py-0.5 text-sm font-bold text-white">{d.posisi || "(posisi)"}</p>
      <div className="mt-2 text-xs"><Contact d={d} /></div>
      <p className="mt-3 font-medium">{d.ringkasan}</p>
      <ExpList d={d} />
      <EduList d={d} />
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-md border border-ink px-2 py-0.5 text-xs font-semibold">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function GeoFlow({ d }: { d: CvData }) {
  return (
    <div className="relative overflow-hidden text-[12.5px] leading-relaxed text-ink">
      <div className="relative bg-paper p-4 pr-16">
        <div aria-hidden="true" className="absolute -right-6 -top-8 h-28 w-28 rotate-12 bg-materai" />
        <h2 className="relative text-3xl font-extrabold">{d.nama || "(nama)"}</h2>
        <p className="relative font-semibold">{d.posisi}</p>
        <div className="relative mt-1 text-[11px]"><Contact d={d} /></div>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-3">
          <p>{d.ringkasan}</p>
          <ExpList d={d} />
        </div>
        <div className="col-span-2">
          <EduList d={d} />
          <Skills d={d} />
        </div>
      </div>
    </div>
  );
}

export default function CvSheet({ data, watermark }: { data: CvData; watermark: boolean }) {
  const t = data.templateId;
  return (
    <div id="cv-sheet" className="relative bg-white p-5 shadow-none sm:p-8">
      {t === "harvard" && <Harvard d={data} />}
      {t === "adelaide" && <Adelaide d={data} />}
      {t === "structura" && <Structura d={data} />}
      {t === "columbia" && <Columbia d={data} />}
      {t === "munich" && <Munich d={data} />}
      {t === "oxford" && <Oxford d={data} />}
      {t === "minimalist" && <Minimalist d={data} />}
      {t === "corporate" && <Corporate d={data} />}
      {t === "bold-impact" && <BoldImpact d={data} />}
      {t === "geo-flow" && <GeoFlow d={data} />}
      {watermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
          <span className="rotate-[-14deg] border-2 border-ink/25 px-5 py-1 font-display text-lg text-ink/30">
            LAMARANKU BASIC
          </span>
        </div>
      )}
    </div>
  );
}
