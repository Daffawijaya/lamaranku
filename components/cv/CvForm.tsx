"use client";

import type { CvData } from "../../lib/cv";

const INPUT = "mt-1 w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-[16px]";
const BTN = "inline-flex min-h-[44px] items-center rounded-lg px-4 py-2 text-sm font-semibold";

export default function CvForm({ value, onChange }: { value: CvData; onChange: (v: CvData) => void }) {
  const set = (p: Partial<CvData>) => onChange({ ...value, ...p });

  return (
    <div className="space-y-4">
      <fieldset className="rounded-[10px] border border-ink/20 bg-white p-4">
        <legend className="px-1 font-display text-lg font-bold">Data diri</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Nama lengkap<input value={value.nama} onChange={(e) => set({ nama: e.target.value })} className={INPUT} autoComplete="name" /></label>
          <label className="text-sm font-semibold">Posisi dituju<input value={value.posisi} onChange={(e) => set({ posisi: e.target.value })} className={INPUT} /></label>
          <label className="text-sm font-semibold">Email<input value={value.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} autoComplete="email" inputMode="email" /></label>
          <label className="text-sm font-semibold">Telepon<input value={value.telepon} onChange={(e) => set({ telepon: e.target.value })} className={INPUT} autoComplete="tel" inputMode="tel" /></label>
        </div>
        <label className="mt-3 block text-sm font-semibold">Alamat singkat<input value={value.alamat} onChange={(e) => set({ alamat: e.target.value })} className={INPUT} placeholder="Kota, Provinsi" /></label>
        <label className="mt-3 block text-sm font-semibold">Ringkasan 1-2 kalimat<textarea value={value.ringkasan} onChange={(e) => set({ ringkasan: e.target.value })} rows={3} className={INPUT} /></label>
      </fieldset>

      <fieldset className="rounded-[10px] border border-ink/20 bg-white p-4">
        <legend className="px-1 font-display text-lg font-bold">Pengalaman</legend>
        {value.pengalaman.length === 0 && (
          <p className="text-sm text-muted">Belum ada pengalaman. Fresh graduate bisa mengosongkan bagian ini atau mengisi organisasi dan magang.</p>
        )}
        {value.pengalaman.map((p, i) => (
          <div key={i} className="mt-3 rounded-lg bg-paper p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">Jabatan<input value={p.jabatan} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, jabatan: e.target.value }; set({ pengalaman: a }); }} className={INPUT} /></label>
              <label className="text-sm font-semibold">Perusahaan<input value={p.perusahaan} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, perusahaan: e.target.value }; set({ pengalaman: a }); }} className={INPUT} /></label>
            </div>
            <label className="mt-3 block text-sm font-semibold">Periode<input value={p.periode} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, periode: e.target.value }; set({ pengalaman: a }); }} className={INPUT} placeholder="2023 - Sekarang" /></label>
            <label className="mt-3 block text-sm font-semibold">Deskripsi hasil<textarea value={p.deskripsi} onChange={(e) => { const a = [...value.pengalaman]; a[i] = { ...p, deskripsi: e.target.value }; set({ pengalaman: a }); }} rows={2} className={INPUT} placeholder="Tulis angka hasil kalau ada, misal menata 500 berkas." /></label>
            <button
              onClick={() => set({ pengalaman: value.pengalaman.filter((_, x) => x !== i) })}
              className={`${BTN} mt-2 border border-ink/25`}
            >
              Hapus pengalaman ini
            </button>
          </div>
        ))}
        <button
          onClick={() => set({ pengalaman: [...value.pengalaman, { jabatan: "", perusahaan: "", periode: "", deskripsi: "" }] })}
          className={`${BTN} mt-3 border border-ink/25`}
        >
          Tambah pengalaman
        </button>
      </fieldset>

      <fieldset className="rounded-[10px] border border-ink/20 bg-white p-4">
        <legend className="px-1 font-display text-lg font-bold">Pendidikan</legend>
        {value.pendidikan.map((p, i) => (
          <div key={i} className="mt-3 grid gap-3 rounded-lg bg-paper p-3 sm:grid-cols-3">
            <label className="text-sm font-semibold">Gelar / jurusan<input value={p.gelar} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, gelar: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
            <label className="text-sm font-semibold">Sekolah<input value={p.sekolah} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, sekolah: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
            <label className="text-sm font-semibold">Tahun<input value={p.tahun} onChange={(e) => { const a = [...value.pendidikan]; a[i] = { ...p, tahun: e.target.value }; set({ pendidikan: a }); }} className={INPUT} /></label>
          </div>
        ))}
        <button
          onClick={() => set({ pendidikan: [...value.pendidikan, { gelar: "", sekolah: "", tahun: "" }] })}
          className={`${BTN} mt-3 border border-ink/25`}
        >
          Tambah pendidikan
        </button>
      </fieldset>

      <fieldset className="rounded-[10px] border border-ink/20 bg-white p-4">
        <legend className="px-1 font-display text-lg font-bold">Keahlian</legend>
        <label className="block text-sm font-semibold">Daftar keahlian, pisahkan dengan koma<textarea value={value.keahlian} onChange={(e) => set({ keahlian: e.target.value })} rows={2} className={INPUT} /></label>
      </fieldset>
    </div>
  );
}
