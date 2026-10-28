"use client";

import type { ReactNode } from "react";
import type { CvData } from "../../lib/cv";
import { Professional } from "./Professional";
import "./professional-template.css";

const text = (value: unknown) => (typeof value === "string" ? value : "");

function Contact({ cv, sep = " | " }: { cv: CvData; sep?: string }) {
  const parts = [cv.email, cv.telepon, cv.alamat].map(text).filter((part) => part.trim() !== "");
  return <p>{parts.join(sep)}</p>;
}

function ExpList({ cv, titleClass = "mt-4 font-bold" }: { cv: CvData; titleClass?: string }) {
  if (cv.pengalaman.length === 0) return null;
  return (
    <div className="cv-end">
      <h3 className={titleClass}>Pengalaman Kerja</h3>
      {cv.pengalaman.map((exp, index) => (
        <div key={index} className="mt-2">
          <p className="font-bold">
            {exp.jabatan || "(jabatan)"} <span className="font-normal">di {exp.perusahaan || "(perusahaan)"}</span>
          </p>
          <p className="text-xs opacity-70">{exp.periode}</p>
          <p className="mt-1">{exp.deskripsi}</p>
        </div>
      ))}
    </div>
  );
}

function EduList({ cv, titleClass = "mt-4 font-bold" }: { cv: CvData; titleClass?: string }) {
  if (cv.pendidikan.length === 0) return null;
  return (
    <div className="cv-end">
      <h3 className={titleClass}>Pendidikan</h3>
      {cv.pendidikan.map((edu, index) => (
        <p key={index} className="mt-1">
          <span className="font-bold">{edu.gelar || "(gelar)"}</span>, {edu.sekolah} ({edu.tahun})
        </p>
      ))}
    </div>
  );
}

function Skills({ cv, titleClass = "mt-4 font-bold" }: { cv: CvData; titleClass?: string }) {
  if (text(cv.keahlian).trim() === "") return null;
  return (
    <div className="cv-end">
      <h3 className={titleClass}>Keahlian</h3>
      <p className="mt-1">{cv.keahlian}</p>
    </div>
  );
}

function Harvard({ cv }: { cv: CvData }) {
  return (
    <div className="font-display text-[13px] leading-relaxed text-ink">
      <h2 className="text-center text-2xl font-bold">{cv.nama || "(nama)"}</h2>
      <p className="mt-1 text-center text-sm font-semibold">{cv.posisi}</p>
      <div className="mt-1 text-center text-xs"><Contact cv={cv} /></div>
      <hr className="my-3 border-t-2 border-ink" />
      <h3 className="text-center font-bold tracking-wide">RINGKASAN</h3>
      <p className="mt-1 text-justify">{cv.ringkasan}</p>
      <hr className="my-3 border-t border-ink/40" />
      <ExpList cv={cv} titleClass="text-center font-bold tracking-wide" />
      <hr className="my-3 border-t border-ink/40" />
      <EduList cv={cv} titleClass="text-center font-bold tracking-wide" />
      <Skills cv={cv} titleClass="mt-3 text-center font-bold tracking-wide" />
    </div>
  );
}

function Adelaide({ cv }: { cv: CvData }) {
  const heading = "mt-4 border-b-2 border-ink pb-1 font-bold";
  return (
    <div className="text-[13px] leading-relaxed text-ink">
      <h2 className="text-3xl font-extrabold">{cv.nama || "(nama)"}</h2>
      <p className="font-semibold text-materai">{cv.posisi}</p>
      <div className="mt-1 text-xs"><Contact cv={cv} sep="  •  " /></div>
      <h3 className={heading}>Ringkasan</h3>
      <p className="mt-1">{cv.ringkasan}</p>
      <ExpList cv={cv} titleClass={heading} />
      <EduList cv={cv} titleClass={heading} />
      <Skills cv={cv} titleClass={heading} />
    </div>
  );
}

function Structura({ cv }: { cv: CvData }) {
  return (
    <div className="text-[12.5px] leading-snug text-ink">
      <h2 className="text-xl font-bold">{cv.nama || "(nama)"} <span className="font-normal">- {cv.posisi}</span></h2>
      <div className="text-xs"><Contact cv={cv} /></div>
      <p className="mt-2"><span className="font-bold">Ringkasan: </span>{cv.ringkasan}</p>
      {cv.pengalaman.map((exp, index) => (
        <p key={`${exp.jabatan}-${exp.perusahaan}-${index}`} className="mt-2">
          <span className="font-bold">{exp.jabatan}</span> | {exp.perusahaan} | {exp.periode}. {exp.deskripsi}
        </p>
      ))}
      {cv.pendidikan.map((edu, index) => (
        <p key={`${edu.gelar}-${edu.sekolah}-${index}`} className="cv-end mt-1"><span className="font-bold">Pendidikan: </span>{edu.gelar}, {edu.sekolah} ({edu.tahun})</p>
      ))}
      {text(cv.keahlian).trim() !== "" && <p className="cv-end mt-1"><span className="font-bold">Keahlian: </span>{cv.keahlian}</p>}
    </div>
  );
}

function Columbia({ cv }: { cv: CvData }) {
  return (
    <div className="text-[13px] leading-relaxed text-ink">
      <h2 className="text-4xl font-black leading-none">{cv.nama || "(nama)"}</h2>
      <p className="mt-1 text-base font-semibold">{cv.posisi}</p>
      <div className="mt-1 text-xs"><Contact cv={cv} sep="   " /></div>
      <hr className="my-3 border-t border-ink" />
      <p className="italic">{cv.ringkasan}</p>
      {cv.pengalaman.map((exp, index) => (
        <div key={`${exp.jabatan}-${exp.perusahaan}-${exp.periode}-${index}`} className="mt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-bold">{exp.jabatan} - {exp.perusahaan}</p>
            <p className="shrink-0 text-xs">{exp.periode}</p>
          </div>
          <p className="mt-1">{exp.deskripsi}</p>
        </div>
      ))}
      <EduList cv={cv} />
      <Skills cv={cv} />
    </div>
  );
}

function Munich({ cv }: { cv: CvData }) {
  const heading = "mt-6 text-xs font-bold uppercase tracking-widest text-muted";
  return (
    <div className="px-2 text-[13px] leading-loose text-ink">
      <h2 className="text-2xl font-light">{cv.nama || "(nama)"}</h2>
      <p className="text-sm">{cv.posisi}</p>
      <div className="mt-1 text-xs text-muted"><Contact cv={cv} sep=" · " /></div>
      <hr className="my-4 border-t border-ink/20" />
      <h3 className={heading}>Ringkasan</h3>
      <p className="mt-1">{cv.ringkasan}</p>
      <ExpList cv={cv} titleClass={heading} />
      <EduList cv={cv} titleClass={heading} />
      <Skills cv={cv} titleClass={heading} />
    </div>
  );
}

function Oxford({ cv }: { cv: CvData }) {
  return (
    <div className="font-display text-[13px] leading-relaxed text-ink">
      <h2 className="text-center text-2xl font-bold underline underline-offset-4">{cv.nama || "(nama)"}</h2>
      <p className="mt-1 text-center italic">{cv.posisi}</p>
      <div className="mt-1 text-center text-xs"><Contact cv={cv} /></div>
      <h3 className="mt-4 font-bold">I. Ringkasan</h3>
      <p className="mt-1">{cv.ringkasan}</p>
      <h3 className="mt-3 font-bold">II. Pengalaman</h3>
      {cv.pengalaman.map((exp, index) => (
        <p key={`${exp.jabatan}-${exp.perusahaan}-${exp.periode}-${index}`} className="mt-1">{exp.periode}: <span className="font-bold">{exp.jabatan}</span>, <span className="italic">{exp.perusahaan}</span>. {exp.deskripsi}</p>
      ))}
      <h3 className="mt-3 font-bold">III. Pendidikan</h3>
      {cv.pendidikan.map((edu, index) => (
        <p key={`${edu.gelar}-${edu.sekolah}-${edu.tahun}-${index}`} className="cv-end mt-1">{edu.tahun}: <span className="font-bold">{edu.gelar}</span>, <span className="italic">{edu.sekolah}</span></p>
      ))}
      {text(cv.keahlian).trim() !== "" && (<><h3 className="mt-3 font-bold">IV. Keahlian</h3><p className="cv-end mt-1">{cv.keahlian}</p></>)}
    </div>
  );
}

function SideShell({ cv, children, side }: { cv: CvData; children: ReactNode; side: ReactNode }) {
  const initial = (text(cv.nama).trim()[0] || "?").toUpperCase();
  const contacts = [cv.email, cv.telepon, cv.alamat].map(text).filter((part) => part.trim() !== "");
  return (
    <div className="flex gap-0 overflow-hidden rounded-sm text-[12.5px] leading-relaxed cv-row">
      <div className="w-40 shrink-0 bg-materai p-4 text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white font-display text-2xl font-bold" aria-hidden="true">{initial}</div>
        <p className="mt-3 font-bold">Kontak</p>
        <div className="mt-1 space-y-1 text-[11px]">{contacts.map((part, index) => <p key={`${part}-${index}`}>{part}</p>)}</div>
        {text(cv.keahlian).trim() !== "" && (<><p className="mt-4 font-bold">Keahlian</p><p className="mt-1 text-[11px]">{cv.keahlian}</p></>)}
        {side}
      </div>
      <div className="flex-1 p-4 text-ink cv-col">{children}</div>
    </div>
  );
}

function Minimalist({ cv }: { cv: CvData }) {
  return (
    <SideShell cv={cv} side={null}>
      <h2 className="text-2xl font-extrabold">{cv.nama || "(nama)"}</h2>
      <p className="font-semibold text-materai">{cv.posisi}</p>
      <p className="mt-2">{cv.ringkasan}</p>
      <ExpList cv={cv} />
      <EduList cv={cv} />
    </SideShell>
  );
}

function Corporate({ cv }: { cv: CvData }) {
  return (
    <div className="overflow-hidden rounded-sm text-[12.5px] leading-relaxed">
      <div className="bg-ink p-4 text-paper">
        <h2 className="text-2xl font-bold">{cv.nama || "(nama)"}</h2>
        <p className="text-sm">{cv.posisi}</p>
        <div className="mt-1 text-[11px] opacity-80"><Contact cv={cv} sep="  •  " /></div>
      </div>
      <div className="flex gap-4 p-4 text-ink cv-stretch">
        <div className="flex-1 cv-col">
          <p>{cv.ringkasan}</p>
          <ExpList cv={cv} />
        </div>
        <div className="w-36 shrink-0 cv-col">
          <EduList cv={cv} />
          <Skills cv={cv} />
        </div>
      </div>
    </div>
  );
}

function BoldImpact({ cv }: { cv: CvData }) {
  const tags = text(cv.keahlian).split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="border-l-8 border-stamp pl-4 text-[13px] leading-relaxed text-ink">
      <h2 className="text-4xl font-black uppercase">{cv.nama || "(nama)"}</h2>
      <p className="mt-1 inline-block bg-stamp px-2 py-0.5 text-sm font-bold text-white">{cv.posisi || "(posisi)"}</p>
      <div className="mt-2 text-xs"><Contact cv={cv} /></div>
      <p className="mt-3 font-medium">{cv.ringkasan}</p>
      <ExpList cv={cv} />
      <EduList cv={cv} />
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 cv-end">
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="rounded-md border border-ink px-2 py-0.5 text-xs font-semibold">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function GeoFlow({ cv }: { cv: CvData }) {
  return (
    <div className="relative overflow-hidden text-[12.5px] leading-relaxed text-ink">
      <div className="relative bg-paper p-4 pr-16">
        <div aria-hidden="true" className="absolute -right-6 -top-8 h-28 w-28 rotate-12 bg-materai" />
        <h2 className="relative text-3xl font-extrabold">{cv.nama || "(nama)"}</h2>
        <p className="relative font-semibold">{cv.posisi}</p>
        <div className="relative mt-1 text-[11px]"><Contact cv={cv} /></div>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4 cv-stretch">
        <div className="col-span-3 cv-col">
          <p>{cv.ringkasan}</p>
          <ExpList cv={cv} />
        </div>
        <div className="col-span-2 cv-col">
          <EduList cv={cv} />
          <Skills cv={cv} />
        </div>
      </div>
    </div>
  );
}

export default function CvSheet({ data, watermark, fill, id }: { data: CvData; watermark: boolean; fill?: boolean; id?: string }) {
  return (
    <div id={id} className={data.templateId === "professional" ? "relative cv-professional-sheet" : `relative bg-white p-5 shadow-none sm:p-8${fill ? " cv-fill flex-1" : ""}`}>
      {data.templateId === "professional" && <Professional cv={data} />}
      {data.templateId === "harvard" && <Harvard cv={data} />}
      {data.templateId === "adelaide" && <Adelaide cv={data} />}
      {data.templateId === "structura" && <Structura cv={data} />}
      {data.templateId === "columbia" && <Columbia cv={data} />}
      {data.templateId === "munich" && <Munich cv={data} />}
      {data.templateId === "oxford" && <Oxford cv={data} />}
      {data.templateId === "minimalist" && <Minimalist cv={data} />}
      {data.templateId === "corporate" && <Corporate cv={data} />}
      {data.templateId === "bold-impact" && <BoldImpact cv={data} />}
      {data.templateId === "geo-flow" && <GeoFlow cv={data} />}
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
