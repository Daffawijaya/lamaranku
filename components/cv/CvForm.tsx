"use client";

import type { Certification, CvData, CvProject, Education, Experience } from "../../lib/cv";
import { SkillsEditor } from "./SkillsEditor";

const INPUT =
  "mt-1 w-full rounded-lg border border-[#b7b7b7] bg-white px-4 py-3 text-base text-[#2c2c2c] placeholder:text-[#6d6d6d] transition-colors hover:border-[#6d6d6d] focus:border-[#1473e6] focus:outline-none focus:ring-2 focus:ring-[#1473e6]/20";
const ADD =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";
const DEL =
  "inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold text-black/55 transition-colors hover:text-black";

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
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Data diri</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#2c2c2c]">Nama lengkap<input value={value.nama} onChange={(e) => set({ nama: e.target.value })} className={INPUT} autoComplete="name" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Posisi dituju<input value={value.posisi} onChange={(e) => set({ posisi: e.target.value })} className={INPUT} /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Email<input value={value.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} autoComplete="email" inputMode="email" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Telepon<input value={value.telepon} onChange={(e) => set({ telepon: e.target.value })} className={INPUT} autoComplete="tel" inputMode="tel" /></label>
        </div>
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Alamat singkat<input value={value.alamat} onChange={(e) => set({ alamat: e.target.value })} className={INPUT} placeholder="Kota, Provinsi" /></label>
        {professional && <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Website / portofolio<input value={value.website ?? ""} onChange={(e) => set({ website: e.target.value })} className={INPUT} placeholder="namakamu.dev" autoComplete="url" /></label>}
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Ringkasan 1-2 kalimat<textarea value={value.ringkasan} onChange={(e) => set({ ringkasan: e.target.value })} rows={3} className={INPUT} /></label>
      </fieldset>}

      {(!section || section === "experience") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Pengalaman</legend>
        {value.pengalaman.length === 0 && (
          <p className="mt-2 text-sm text-black/65">Belum ada pengalaman. Fresh graduate bisa mengosongkan bagian ini atau mengisi organisasi dan magang.</p>
        )}
        {value.pengalaman.map((exp, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]">Jabatan<input value={exp.jabatan} onChange={(e) => patchPengalaman(index, { jabatan: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]">Perusahaan<input value={exp.perusahaan} onChange={(e) => patchPengalaman(index, { perusahaan: e.target.value })} className={INPUT} /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Periode<input value={exp.periode} onChange={(e) => patchPengalaman(index, { periode: e.target.value })} className={INPUT} placeholder="2023 - Sekarang" /></label>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">{professional ? "Deskripsi hasil, satu poin per baris" : "Deskripsi hasil"}<textarea value={exp.deskripsi} onChange={(e) => patchPengalaman(index, { deskripsi: e.target.value })} rows={professional ? 4 : 2} className={INPUT} placeholder="Tulis angka hasil kalau ada, misal menata 500 berkas." /></label>
            <button
              type="button"
              onClick={() => set({ pengalaman: value.pengalaman.filter((_, at) => at !== index) })}
              className={`${DEL} mt-2`}
            >
              Hapus pengalaman ini
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ pengalaman: [...value.pengalaman, { jabatan: "", perusahaan: "", periode: "", deskripsi: "" }] })}
          className={`${ADD} mt-4`}
        >
          Tambah pengalaman
        </button>
      </fieldset>}

      {(!section || section === "education") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Pendidikan</legend>
        {value.pendidikan.map((edu, index) => (
          <div key={index} className="mt-4 grid gap-4 rounded-2xl bg-[#f8f8f8] p-4 sm:grid-cols-3 sm:p-5">
            <label className="text-sm font-bold text-[#2c2c2c]">Gelar / jurusan<input value={edu.gelar} onChange={(e) => patchPendidikan(index, { gelar: e.target.value })} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]">Sekolah<input value={edu.sekolah} onChange={(e) => patchPendidikan(index, { sekolah: e.target.value })} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]">Tahun<input value={edu.tahun} onChange={(e) => patchPendidikan(index, { tahun: e.target.value })} className={INPUT} /></label>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ pendidikan: [...value.pendidikan, { gelar: "", sekolah: "", tahun: "" }] })}
          className={`${ADD} mt-4`}
        >
          Tambah pendidikan
        </button>
      </fieldset>}

      {professional && (!section || section === "projects") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Proyek</legend>
        {projects.length === 0 && <p className="mt-2 text-sm text-black/65">Tambahkan proyek yang relevan dengan posisi tujuan.</p>}
        {projects.map((project, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]">Nama proyek<input value={project.nama} onChange={(e) => patchProject(index, { nama: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]">Peran di proyek<input value={project.peran} onChange={(e) => patchProject(index, { peran: e.target.value })} className={INPUT} /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Periode proyek<input value={project.periode} onChange={(e) => patchProject(index, { periode: e.target.value })} className={INPUT} placeholder="2024 - 2025" /></label>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Deskripsi proyek, satu poin per baris<textarea value={project.deskripsi} onChange={(e) => patchProject(index, { deskripsi: e.target.value })} rows={4} className={INPUT} /></label>
            <button type="button" onClick={() => set({ proyek: projects.filter((_, at) => at !== index) })} className={`${DEL} mt-2`}>Hapus proyek ini</button>
          </div>
        ))}
        <button type="button" onClick={() => set({ proyek: [...projects, { nama: "", peran: "", periode: "", deskripsi: "" }] })} className={`${ADD} mt-4`}>Tambah proyek</button>
      </fieldset>}

      {(!section || section === "skills") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Keahlian</legend>
        <div className="mt-4 grid gap-4">
          <SkillsEditor label={professional ? "Keahlian teknis" : "Keahlian"} value={value.keahlian}
            separator={professional ? "\n" : ", "} onChange={keahlian => set({ keahlian })}
            placeholder={professional ? "Contoh: React atau Microsoft Excel" : "Contoh: Microsoft Excel"} />
          {professional && <>
            <SkillsEditor label="Hard skills" value={value.hardSkills ?? ""} onChange={hardSkills => set({ hardSkills })} placeholder="Contoh: Analisis data" />
            <SkillsEditor label="Soft skills" value={value.softSkills ?? ""} onChange={softSkills => set({ softSkills })} placeholder="Contoh: Komunikasi" />
          </>}
        </div>
      </fieldset>}

      {professional && (!section || section === "certifications") && <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Sertifikasi</legend>
        {certifications.length === 0 && <p className="mt-2 text-sm text-black/65">Tambahkan sertifikasi atau pelatihan yang ingin ditampilkan.</p>}
        {certifications.map((certification, index) => (
          <div key={index} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <label className="block text-sm font-bold text-[#2c2c2c]">Nama sertifikasi<input value={certification.nama} onChange={(e) => patchCertification(index, { nama: e.target.value })} className={INPUT} /></label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]">Penerbit / penyelenggara<input value={certification.penerbit} onChange={(e) => patchCertification(index, { penerbit: e.target.value })} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]">Tahun sertifikasi<input value={certification.tahun} onChange={(e) => patchCertification(index, { tahun: e.target.value })} className={INPUT} /></label>
            </div>
            <button type="button" onClick={() => set({ sertifikasi: certifications.filter((_, at) => at !== index) })} className={`${DEL} mt-2`}>Hapus sertifikasi ini</button>
          </div>
        ))}
        <button type="button" onClick={() => set({ sertifikasi: [...certifications, { nama: "", penerbit: "", tahun: "" }] })} className={`${ADD} mt-4`}>Tambah sertifikasi</button>
      </fieldset>}
    </div>
  );
}
