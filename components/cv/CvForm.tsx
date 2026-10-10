"use client";

import type { CvData } from "../../lib/cv";

const INPUT =
  "mt-1 w-full rounded-lg border border-[#b7b7b7] bg-white px-4 py-3 text-base text-[#2c2c2c] placeholder:text-[#6d6d6d] transition-colors hover:border-[#6d6d6d] focus:border-[#1473e6] focus:outline-none focus:ring-2 focus:ring-[#1473e6]/20";
const ADD =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#2c2c2c] px-6 py-2.5 text-sm font-bold text-[#2c2c2c] transition-colors hover:bg-[#2c2c2c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c2c2c]";
const DEL =
  "inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-bold text-black/55 transition-colors hover:text-black";

export default function CvForm({ value, onChange }: { value: CvData; onChange: (v: CvData) => void }) {
  const set = (p: Partial<CvData>) => onChange({ ...value, ...p });

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Data diri</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#2c2c2c]">Nama lengkap<input value={value.nama} onChange={(e) => set({ nama: e.target.value })} className={INPUT} autoComplete="name" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Posisi dituju<input value={value.posisi} onChange={(e) => set({ posisi: e.target.value })} className={INPUT} /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Email<input value={value.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} autoComplete="email" inputMode="email" /></label>
          <label className="text-sm font-bold text-[#2c2c2c]">Telepon<input value={value.telepon} onChange={(e) => set({ telepon: e.target.value })} className={INPUT} autoComplete="tel" inputMode="tel" /></label>
        </div>
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Alamat singkat<input value={value.alamat} onChange={(e) => set({ alamat: e.target.value })} className={INPUT} placeholder="Kota, Provinsi" /></label>
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Ringkasan 1-2 kalimat<textarea value={value.ringkasan} onChange={(e) => set({ ringkasan: e.target.value })} rows={3} className={INPUT} /></label>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Pengalaman</legend>
        {value.pengalaman.length === 0 && (
          <p className="mt-2 text-sm text-black/65">Belum ada pengalaman. Fresh graduate bisa mengosongkan bagian ini atau mengisi organisasi dan magang.</p>
        )}
        {value.pengalaman.map((p, i) => (
          <div key={i} className="mt-4 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#2c2c2c]">Jabatan<input value={p.jabatan} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, jabatan: e.target.value }; set({ pengalaman: a }); }} className={INPUT} /></label>
              <label className="text-sm font-bold text-[#2c2c2c]">Perusahaan<input value={p.perusahaan} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, perusahaan: e.target.value }; set({ pengalaman: a }); }} className={INPUT} /></label>
            </div>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Periode<input value={p.periode} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, periode: e.target.value }; set({ pengalaman: a }); }} className={INPUT} placeholder="2023 - Sekarang" /></label>
            <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Deskripsi hasil<textarea value={p.deskripsi} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, deskripsi: e.target.value }; set({ pengalaman: a }); }} rows={2} className={INPUT} placeholder="Tulis angka hasil kalau ada, misal menata 500 berkas." /></label>
            <button
              onClick={() => set({ pengalaman: value.pengalaman.filter((_, x) => x !== i) })}
              className={`${DEL} mt-2`}
            >
              Hapus pengalaman ini
            </button>
          </div>
        ))}
        <button
          onClick={() => set({ pengalaman: [...value.pengalaman, { jabatan: "", perusahaan: "", periode: "", deskripsi: "" }] })}
          className={`${ADD} mt-4`}
        >
          Tambah pengalaman
        </button>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Pendidikan</legend>
        {value.pendidikan.map((p, i) => (
          <div key={i} className="mt-4 grid gap-4 rounded-2xl bg-[#f8f8f8] p-4 sm:grid-cols-3 sm:p-5">
            <label className="text-sm font-bold text-[#2c2c2c]">Gelar / jurusan<input value={p.gelar} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, gelar: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]">Sekolah<input value={p.sekolah} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, sekolah: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
            <label className="text-sm font-bold text-[#2c2c2c]">Tahun<input value={p.tahun} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, tahun: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
          </div>
        ))}
        <button
          onClick={() => set({ pendidikan: [...value.pendidikan, { gelar: "", sekolah: "", tahun: "" }] })}
          className={`${ADD} mt-4`}
        >
          Tambah pendidikan
        </button>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-extrabold tracking-[-0.02em] text-zinc-900">Keahlian</legend>
        <label className="mt-4 block text-sm font-bold text-[#2c2c2c]">Daftar keahlian, pisahkan dengan koma<textarea value={value.keahlian} onChange={(e) => set({ keahlian: e.target.value })} rows={2} className={INPUT} /></label>
      </fieldset>
    </div>
  );
}
