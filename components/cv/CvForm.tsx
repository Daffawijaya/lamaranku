"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import type { Certification, CvData, CvProject, Education, Experience } from "../../lib/cv";
import { SkillsEditor } from "./SkillsEditor";

const INPUT =
  "dash-ui-field mt-1 w-full rounded-lg border border-[#b7b7b7] bg-white px-4 py-3 text-base text-[#2c2c2c] placeholder:text-[#6d6d6d] transition-colors hover:border-[#6d6d6d] focus:border-[var(--appearance-accent,#1473e6)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--appearance-accent,#1473e6)_20%,transparent)]";
const ADD =
  "dash-ui-button inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";
const DEL =
  "dash-ui-button dash-ui-button-ghost inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold text-black/55 transition-colors hover:text-black";

export type CvSection = "profile" | "experience" | "education" | "projects" | "skills" | "certifications";
export default function CvForm({ value, onChange, section }: { value: CvData; onChange: (v: CvData) => void; section?: CvSection }) {
  const set = (patch: Partial<CvData>) => onChange({ ...value, ...patch });
  const professional = value.templateId === "professional";
  const projects = value.proyek ?? [];
  const certifications = value.sertifikasi ?? [];

  const patchPengalaman = (index: number, patch: Partial<Experience>) => {
    const next = [...value.pengalaman];
    next[index] = { ...next[index], ...patch };
    set({ pengalaman: next });
  };
  const patchPendidikan = (index: number, patch: Partial<Education>) => {
    const next = [...value.pendidikan];
    next[index] = { ...next[index], ...patch };
    set({ pendidikan: next });
  };
  const patchProject = (index: number, patch: Partial<CvProject>) => {
    const next = [...projects];
    next[index] = { ...next[index], ...patch };
    set({ proyek: next });
  };
  const patchCertification = (index: number, patch: Partial<Certification>) => {
    const next = [...certifications];
    next[index] = { ...next[index], ...patch };
    set({ sertifikasi: next });
  };

  return (
    <div className="space-y-8">
      {(!section || section === "profile") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Data diri"} /></legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Nama lengkap"} /><input value={value.nama} onChange={(e) => set({ nama: e.target.value })} className={INPUT} autoComplete="name" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Posisi dituju"} /><input value={value.posisi} onChange={(e) => set({ posisi: e.target.value })} className={INPUT} /></label>
          <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Email"} /><input value={value.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} autoComplete="email" inputMode="email" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Telepon"} /><input value={value.telepon} onChange={(e) => set({ telepon: e.target.value })} className={INPUT} autoComplete="tel" inputMode="tel" /></label>
        </div>
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Alamat singkat"} /><LocalizedAttributes><input value={value.alamat} onChange={(e) => set({ alamat: e.target.value })} className={INPUT} placeholder="Kota, Provinsi" /></LocalizedAttributes></label>
        {professional && <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Website / portofolio"} /><LocalizedAttributes><input value={value.website ?? ""} onChange={(e) => set({ website: e.target.value })} className={INPUT} placeholder="namakamu.dev" autoComplete="url" /></LocalizedAttributes></label>}
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Ringkasan 1-2 kalimat"} /><textarea value={value.ringkasan} onChange={(e) => set({ ringkasan: e.target.value })} rows={3} className={INPUT} /></label>
      </fieldset>}

      {(!section || section === "experience") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Pengalaman"} /></legend>
        {value.pengalaman.length === 0 && (
          <p className="mt-2 text-sm text-black/65"><T text={"Belum ada pengalaman. Fresh graduate bisa mengosongkan bagian ini atau mengisi organisasi dan magang."} /></p>
        )}
        {value.pengalaman.map((exp, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Jabatan"} /><input value={exp.jabatan} onChange={(e) => patchPengalaman(index, { jabatan: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Perusahaan"} /><input value={exp.perusahaan} onChange={(e) => patchPengalaman(index, { perusahaan: e.target.value })} className={INPUT} /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Periode"} /><LocalizedAttributes><input value={exp.periode} onChange={(e) => patchPengalaman(index, { periode: e.target.value })} className={INPUT} placeholder="2023 - Sekarang" /></LocalizedAttributes></label>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={professional ? "Deskripsi hasil, satu poin per baris" : "Deskripsi hasil"} /><LocalizedAttributes><textarea value={exp.deskripsi} onChange={(e) => patchPengalaman(index, { deskripsi: e.target.value })} rows={professional ? 4 : 2} className={INPUT} placeholder="Tulis angka hasil kalau ada, misal menata 500 berkas." /></LocalizedAttributes></label>
            <button
              type="button"
              onClick={() => set({ pengalaman: value.pengalaman.filter((_, at) => at !== index) })}
              className={`${DEL} mt-2`}
            >
              <T text={"Hapus pengalaman ini "} /></button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ pengalaman: [...value.pengalaman, { jabatan: "", perusahaan: "", periode: "", deskripsi: "" }] })}
          className={`${ADD} mt-4`}
        >
          <T text={"Tambah pengalaman "} /></button>
      </fieldset>}

      {(!section || section === "education") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Pendidikan"} /></legend>
        {value.pendidikan.map((edu, index) => (
          <div key={index} className="mt-4 grid gap-4 rounded-2xl bg-[#f8f8f8] p-4 sm:grid-cols-3 sm:p-5">
            <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Gelar / jurusan"} /><input value={edu.gelar} onChange={(e) => patchPendidikan(index, { gelar: e.target.value })} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Sekolah"} /><input value={edu.sekolah} onChange={(e) => patchPendidikan(index, { sekolah: e.target.value })} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Tahun"} /><input value={edu.tahun} onChange={(e) => patchPendidikan(index, { tahun: e.target.value })} className={INPUT} /></label>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ pendidikan: [...value.pendidikan, { gelar: "", sekolah: "", tahun: "" }] })}
          className={`${ADD} mt-4`}
        >
          <T text={"Tambah pendidikan "} /></button>
      </fieldset>}

      {professional && (!section || section === "projects") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Proyek"} /></legend>
        {projects.length === 0 && <p className="mt-2 text-sm text-black/65"><T text={"Tambahkan proyek yang relevan dengan posisi tujuan."} /></p>}
        {projects.map((project, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Nama proyek"} /><input value={project.nama} onChange={(e) => patchProject(index, { nama: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Peran di proyek"} /><input value={project.peran} onChange={(e) => patchProject(index, { peran: e.target.value })} className={INPUT} /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Periode proyek"} /><input value={project.periode} onChange={(e) => patchProject(index, { periode: e.target.value })} className={INPUT} placeholder="2024 - 2025" /></label>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]"><T text={"Deskripsi proyek, satu poin per baris"} /><textarea value={project.deskripsi} onChange={(e) => patchProject(index, { deskripsi: e.target.value })} rows={4} className={INPUT} /></label>
            <button type="button" onClick={() => set({ proyek: projects.filter((_, at) => at !== index) })} className={`${DEL} mt-2`}><T text={"Hapus proyek ini"} /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ proyek: [...projects, { nama: "", peran: "", periode: "", deskripsi: "" }] })} className={`${ADD} mt-4`}><T text={"Tambah proyek"} /></button>
      </fieldset>}

      {(!section || section === "skills") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Keahlian"} /></legend>
        <div className="mt-4 grid gap-4">
          <LocalizedAttributes><SkillsEditor label={professional ? "Keahlian teknis" : "Keahlian"} value={value.keahlian}
            separator={professional ? "\n" : ", "} onChange={keahlian => set({ keahlian })}
            placeholder={professional ? "Contoh: React atau Microsoft Excel" : "Contoh: Microsoft Excel"} /></LocalizedAttributes>
          {professional && <>
            <LocalizedAttributes><SkillsEditor label="Hard skills" value={value.hardSkills ?? ""} onChange={hardSkills => set({ hardSkills })} placeholder="Contoh: Analisis data" /></LocalizedAttributes>
            <LocalizedAttributes><SkillsEditor label="Soft skills" value={value.softSkills ?? ""} onChange={softSkills => set({ softSkills })} placeholder="Contoh: Komunikasi" /></LocalizedAttributes>
          </>}
        </div>
      </fieldset>}

      {professional && (!section || section === "certifications") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900"><T text={"Sertifikasi"} /></legend>
        {certifications.length === 0 && <p className="mt-2 text-sm text-black/65"><T text={"Tambahkan sertifikasi atau pelatihan yang ingin ditampilkan."} /></p>}
        {certifications.map((certification, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <label className="block text-sm font-bold text-[#2c2c2c]"><T text={"Nama sertifikasi"} /><input value={certification.nama} onChange={(e) => patchCertification(index, { nama: e.target.value })} className={INPUT} /></label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Penerbit / penyelenggara"} /><input value={certification.penerbit} onChange={(e) => patchCertification(index, { penerbit: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]"><T text={"Tahun sertifikasi"} /><input value={certification.tahun} onChange={(e) => patchCertification(index, { tahun: e.target.value })} className={INPUT} /></label>
            </div>
            <button type="button" onClick={() => set({ sertifikasi: certifications.filter((_, at) => at !== index) })} className={`${DEL} mt-2`}><T text={"Hapus sertifikasi ini"} /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ sertifikasi: [...certifications, { nama: "", penerbit: "", tahun: "" }] })} className={`${ADD} mt-4`}><T text={"Tambah sertifikasi"} /></button>
      </fieldset>}
    </div>
  );
}
