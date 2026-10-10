"use client";

import { useEffect, useState } from "react";
import { PLUS_PRICE } from "../data/features";
import { wa } from "../lib/wa";

const CV_KEY = "lamaranku_cv_count";
const SURAT_KEY = "lamaranku_surat_count_v2";
const SURAT_MONTH_KEY = "lamaranku_surat_month";

const BTN = "min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold";
const INPUT = "mt-1 w-full rounded-md border border-transparent bg-li-input px-3 py-2 text-[16px] text-li-text placeholder:text-li-muted focus:border-li-link";

export function usePlan() {
  const [isPlus, setIsPlus] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setIsPlus(localStorage.getItem("lamaranku_plus") === "1");
    } catch {}
    setReady(true);
  }, []);
  const upgradeDemo = () => {
    try {
      localStorage.setItem("lamaranku_plus", "1");
    } catch {}
    setIsPlus(true);
  };
  const downgradeDemo = () => {
    try {
      localStorage.setItem("lamaranku_plus", "0");
    } catch {}
    setIsPlus(false);
  };
  return { isPlus, upgradeDemo, downgradeDemo, ready };
}

export function SuratDemoLive() {
  const { isPlus, upgradeDemo, downgradeDemo } = usePlan();
  return (
    <div>
      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className={`rounded-full px-3 py-1 font-bold ${isPlus ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}>
          Mode: {isPlus ? "Plus" : "Basic"}
        </span>
        {isPlus ? (
          <button onClick={downgradeDemo} className="underline">Lihat sebagai Basic</button>
        ) : (
          <button onClick={upgradeDemo} className="underline">Lihat sebagai Plus</button>
        )}
      </div>
      <SuratDemo isPlus={isPlus} />
    </div>
  );
}

export function SuratDemo({ isPlus }: { isPlus: boolean }) {
  const [nama, setNama] = useState("Ridwan");
  const [perusahaan, setPerusahaan] = useState("PT Maju Jaya");
  const [posisi, setPosisi] = useState("Staff Administrasi");
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    try {
      if (localStorage.getItem(SURAT_MONTH_KEY) !== month) {
        localStorage.setItem(SURAT_MONTH_KEY, month);
        localStorage.setItem(SURAT_KEY, "0");
      }
      setCount(Number(localStorage.getItem(SURAT_KEY) || "0") || 0);
    } catch {}
    setLoaded(true);
  }, []);

  const limit = isPlus ? Infinity : 3;
  const bisa = count < limit;

  const buat = () => {
    if (!bisa) return;
    const next = count + 1;
    try {
      localStorage.setItem(SURAT_KEY, String(next));
    } catch {}
    setCount(next);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-lg border border-white/10 bg-li-card p-4 sm:p-5 lg:col-span-2">
        <h3 className="text-lg font-bold text-li-text">Tujuan surat</h3>
        <p className="mt-1 text-sm text-li-muted">Data contoh, silakan ganti dengan tujuanmu.</p>
        <label className="mt-4 block text-sm font-semibold text-li-text">
          Nama pengirim
          <input value={nama} onChange={(e) => setNama(e.target.value)} className={INPUT} autoComplete="name" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-li-text">
          Perusahaan tujuan
          <input value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} className={INPUT} />
        </label>
        <label className="mt-3 block text-sm font-semibold text-li-text">
          Posisi yang dilamar
          <input value={posisi} onChange={(e) => setPosisi(e.target.value)} className={INPUT} />
        </label>
        <p className="mt-3 text-sm text-li-muted" role="status">
          {loaded ? `Surat bulan ini: ${count} dari ${isPlus ? "tanpa batas" : "3 surat"}. Kuota ulang tiap awal bulan.` : "Memuat kuota..."}
        </p>
        <button onClick={buat} disabled={!bisa} className={`${BTN} mt-2 bg-li-blue text-white hover:bg-li-blueHover disabled:opacity-40`}>
          {bisa ? "Buat surat" : "Kuota Basic habis"}
        </button>
        {!bisa && (
          <a href={wa("Halo Lamaranku, kuota 3 surat saya habis, saya mau upgrade Plus")} className={`${BTN} mt-3 inline-flex items-center bg-li-gold text-black`}>
            Minta link bayar Plus
          </a>
        )}
      </div>
      <div className="rounded-lg border border-white/10 bg-li-card p-4 text-sm leading-relaxed text-li-text sm:p-5 lg:col-span-3">
        <h3 className="text-lg font-bold">Bacaan surat</h3>
        <div className="mt-3 rounded-lg border border-white/10 bg-white p-4 text-ink">
          <p>Yth. HRD {perusahaan.trim() === "" ? "(perusahaan)" : perusahaan},</p>
          <p className="mt-2">
            Saya, {nama.trim() === "" ? "(nama)" : nama}, mengajukan lamaran untuk posisi{" "}
            {posisi.trim() === "" ? "(posisi)" : posisi}. Saya melampirkan CV dan portofolio
            untuk bahan pertimbangan.
          </p>
          <p className="mt-2">
            Hormat saya,
            <br />
            {nama.trim() === "" ? "(nama)" : nama}
          </p>
          {!isPlus && <p className="mt-3 border-t border-ink/15 pt-2 text-xs text-muted">Dibuat dengan paket Basic Lamaranku.</p>}
        </div>
      </div>
    </div>
  );
}
