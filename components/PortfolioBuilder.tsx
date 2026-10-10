"use client";

import { useEffect, useState } from "react";
import { PLUS_PRICE } from "../data/features";
import { wa } from "../lib/wa";
const KEY = "lamaranku_portfolios";
const INPUT = "mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-[16px] text-zinc-900";
const BTN = "inline-flex min-h-[44px] items-center justify-center rounded-full px-6 text-sm font-bold";

export interface Project {
  judul: string;
  deskripsi: string;
  tautan: string;
}

export interface PortfolioData {
  nama: string;
  peran: string;
  bio: string;
  email: string;
  tautan: string;
  keahlian: string;
  projects: Project[];
}

interface SavedPortfolio {
  id: string;
  judul: string;
  updatedAt: string;
  data: PortfolioData;
}

const DEFAULTS: PortfolioData = {
  nama: "Ridwan",
  peran: "Staff Administrasi",
  bio: "Satu tahun mengelola arsip dan Excel di koperasi. Rapi, teliti, terbiasa target bulanan.",
  email: "ridwan.contoh@email.com",
  tautan: "",
  keahlian: "Excel, Arsip, Surat-menyurat",
  projects: [
    { judul: "Arsip Digital Koperasi", deskripsi: "Menata 500+ berkas fisik menjadi arsip digital yang mudah dicari.", tautan: "" }
  ]
};

function load(): SavedPortfolio[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function PortfolioBuilder() {
  const [data, setData] = useState<PortfolioData>(DEFAULTS);
  const [saved, setSaved] = useState<SavedPortfolio[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const set = (p: Partial<PortfolioData>) => setData({ ...data, ...p });

  useEffect(() => setSaved(load()), []);

  const simpan = () => {
    const entry: SavedPortfolio = {
      id: editingId ?? `pf-${Date.now()}`,
      judul: `${data.nama || "Portfolio"} - ${data.peran || "Tanpa peran"}`,
      updatedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      data
    };
    const next = editingId ? saved.map((s) => (s.id === editingId ? entry : s)) : [...saved, entry];
    setSaved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setEditingId(entry.id);
    setNotice(`Tersimpan: ${entry.judul}.`);
  };

  const skills = data.keahlian.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <fieldset className="rounded-2xl bg-zinc-100 p-5">
          <legend className="px-1 text-lg font-bold">Profil</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold">Nama<input value={data.nama} onChange={(e) => set({ nama: e.target.value })} className={INPUT} autoComplete="name" /></label>
            <label className="text-sm font-bold">Peran<input value={data.peran} onChange={(e) => set({ peran: e.target.value })} className={INPUT} /></label>
          </div>
          <label className="mt-3 block text-sm font-bold">Bio singkat<textarea value={data.bio} onChange={(e) => set({ bio: e.target.value })} rows={3} className={INPUT} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="mt-3 block text-sm font-bold">Email<input value={data.email} onChange={(e) => set({ email: e.target.value })} className={INPUT} inputMode="email" /></label>
            <label className="mt-3 block text-sm font-bold">Tautan (opsional)<input value={data.tautan} onChange={(e) => set({ tautan: e.target.value })} className={INPUT} placeholder="link media sosial atau web" /></label>
          </div>
          <label className="mt-3 block text-sm font-bold">Keahlian, pisahkan koma<textarea value={data.keahlian} onChange={(e) => set({ keahlian: e.target.value })} rows={2} className={INPUT} /></label>
        </fieldset>

        <fieldset className="rounded-2xl bg-zinc-100 p-5">
          <legend className="px-1 text-lg font-bold">Karya</legend>
          {data.projects.length === 0 && (
            <p className="text-sm text-zinc-600">Belum ada karya. Tambahkan satu di bawah.</p>
          )}
          {data.projects.map((p, i) => (
            <div key={i} className="mt-3 rounded-2xl bg-white p-4">
              <label className="block text-sm font-bold">Judul karya<input value={p.judul} onChange={(e) => { const a = [...data.projects]; a[i] = { ...p, judul: e.target.value }; set({ projects: a }); }} className={INPUT} /></label>
              <label className="mt-3 block text-sm font-bold">Deskripsi<textarea value={p.deskripsi} onChange={(e) => { const a = [...data.projects]; a[i] = { ...p, deskripsi: e.target.value }; set({ projects: a }); }} rows={2} className={INPUT} /></label>
              <label className="mt-3 block text-sm font-bold">Tautan (opsional)<input value={p.tautan} onChange={(e) => { const a = [...data.projects]; a[i] = { ...p, tautan: e.target.value }; set({ projects: a }); }} className={INPUT} /></label>
              <button onClick={() => set({ projects: data.projects.filter((_, x) => x !== i) })} className={`${BTN} mt-2 border border-zinc-300`}>
                Hapus karya ini
              </button>
            </div>
          ))}
          <button
            onClick={() => set({ projects: [...data.projects, { judul: "", deskripsi: "", tautan: "" }] })}
            className={`${BTN} mt-3 border border-zinc-300`}
          >
            Tambah karya
          </button>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="bg-zinc-900 p-6 text-white sm:p-8">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{data.nama || "(nama)"}</h2>
            <p className="mt-1 text-sm text-white/70">{data.peran || "(peran)"}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{data.bio}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
              {data.email.trim() !== "" && <span>{data.email}</span>}
              {data.tautan.trim() !== "" && <span>{data.tautan}</span>}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-900">{s}</span>
                ))}
              </div>
            )}
            <div className="mt-6 space-y-4">
              {data.projects.map((p, i) => (
                <div key={i} className="rounded-2xl bg-zinc-100 p-4">
                  <p className="font-bold text-zinc-900">{p.judul || "(judul karya)"}</p>
                  <p className="mt-1 text-sm text-zinc-600">{p.deskripsi}</p>
                  {p.tautan.trim() !== "" && <p className="mt-1 text-xs text-zinc-500">{p.tautan}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-zinc-100 p-5">
          <p className="text-sm text-zinc-600" role="status">
            Tersimpan {saved.length} portfolio di peramban ini.{notice ? ` ${notice}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={simpan} className={`${BTN} bg-zinc-900 text-white`}>
              {editingId ? "Perbarui simpanan" : "Simpan portfolio"}
            </button>
            <button onClick={() => window.print()} className={`${BTN} border border-zinc-300 bg-white`}>
              Unduh PDF
            </button>
          </div>
          {saved.length > 0 && (
            <ul className="mt-3 divide-y divide-zinc-200">
              {saved.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-bold">{s.judul}</span>
                    <span className="block text-xs text-zinc-500">{s.updatedAt}</span>
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button onClick={() => { setData(s.data); setEditingId(s.id); setNotice(null); }} className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-300 px-3">Buka</button>
                    <button onClick={() => { const next = saved.filter((x) => x.id !== s.id); setSaved(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} if (editingId === s.id) setEditingId(null); }} className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-300 px-3">Hapus</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 rounded-2xl bg-[#191919] p-4 text-white">
            <p className="text-sm font-bold">Link online lamaranku.id/nama segera hadir di Plus ({PLUS_PRICE}).</p>
            <a href={wa("Halo Lamaranku, saya mau info link portfolio Plus")} className={`${BTN} mt-2 bg-[#1473E6] text-white`}>
              Minta info Plus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
