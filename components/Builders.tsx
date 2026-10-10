"use client";

import { useEffect, useState } from "react";
import { PLUS_PRICE, WA_NUMBER } from "../data/features";

const CV_KEY = "lamaranku_cv_count";
const SURAT_KEY = "lamaranku_surat_count_v2";
const SURAT_MONTH_KEY = "lamaranku_surat_month";

function waLink(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

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

export function CvDemo({ isPlus }: { isPlus: boolean }) {
  const [nama, setNama] = useState("Ridwan");
  const [posisi, setPosisi] = useState("Staff Administrasi");
  const [pengalaman, setPengalaman] = useState("Satu tahun mengelola arsip dan Excel di koperasi.");
  const [saved, setSaved] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setSaved(Number(localStorage.getItem(CV_KEY) || "0") || 0);
    } catch {}
    setLoaded(true);
  }, []);

  const limit = isPlus ? Infinity : 2;
  const bisaSimpan = saved < limit;

  const simpan = () => {
    if (!bisaSimpan) return;
    const next = saved + 1;
    try {
      localStorage.setItem(CV_KEY, String(next));
    } catch {}
    setSaved(next);
  };

  const reset = () => {
    try {
      localStorage.setItem(CV_KEY, "0");
    } catch {}
    setSaved(0);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="rounded-lg border border-white/10 bg-li-card p-4 sm:p-5 lg:col-span-2">
        <h3 className="text-lg font-bold text-li-text">Isi data</h3>
        <p className="mt-1 text-sm text-li-muted">Data contoh, silakan ganti dengan datamu. Tanpa daftar untuk mencoba.</p>
        <label className="mt-4 block text-sm font-semibold text-li-text">
          Nama lengkap
          <input value={nama} onChange={(e) => setNama(e.target.value)} className={INPUT} autoComplete="name" />
        </label>
        <label className="mt-3 block text-sm font-semibold text-li-text">
          Posisi yang dituju
          <input value={posisi} onChange={(e) => setPosisi(e.target.value)} className={INPUT} />
        </label>
        <label className="mt-3 block text-sm font-semibold text-li-text">
          Pengalaman singkat
          <textarea value={pengalaman} onChange={(e) => setPengalaman(e.target.value)} rows={3} className={INPUT} />
        </label>
        <p className="mt-3 text-sm text-li-muted" role="status">
          {loaded ? `Tersimpan: ${saved} dari ${isPlus ? "tanpa batas" : "2 CV"}.` : "Memuat simpanan..."}
        </p>
        {loaded && saved === 0 && (
          <p className="mt-1 text-sm text-li-muted">Belum ada CV tersimpan di peramban ini. Hasil contoh di samping bisa langsung dipakai.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={simpan} disabled={!bisaSimpan} className={`${BTN} bg-li-blue text-white hover:bg-li-blueHover disabled:opacity-40`}>
            {bisaSimpan ? "Simpan CV" : "Batas Basic habis"}
          </button>
          <button onClick={reset} className={`${BTN} border border-li-blue text-li-link hover:bg-li-blue/10`}>Ulangi contoh</button>
        </div>
        {!bisaSimpan && (
          <div className="mt-3 rounded-lg border border-li-gold/40 bg-li-gold/10 p-3 text-sm">
            <p className="font-semibold text-li-gold">CV ketiga perlu Plus ({PLUS_PRICE}).</p>
            <a href={waLink(`Halo Lamaranku, saya mau upgrade Plus ${PLUS_PRICE} supaya CV tanpa batas`)} className={`${BTN} mt-2 inline-flex items-center bg-li-gold text-black`}>
              Minta link bayar Plus
            </a>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-li-card p-4 sm:p-5 lg:col-span-3">
        <h3 className="text-lg font-bold text-li-text">Hasil dan unduh</h3>
        <div className="relative mt-3 rounded-lg border border-white/10 bg-white p-4 text-ink">
          <div className="text-lg font-bold">{nama.trim() === "" ? "(nama belum diisi)" : nama}</div>
          <div className="text-sm font-semibold text-materai">{posisi.trim() === "" ? "(posisi belum diisi)" : posisi}</div>
          <p className="mt-2 text-sm">{pengalaman.trim() === "" ? "(pengalaman belum diisi)" : pengalaman}</p>
          {!isPlus && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg" aria-hidden="true">
              <span className="rotate-[-14deg] border-2 border-ink/25 px-5 py-1 font-display text-lg text-ink/30">
                LAMARANKU BASIC
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => window.print()} className={`${BTN} border border-white/20 text-li-text hover:bg-white/10`}>Unduh PDF</button>
          <span className="text-li-muted">{isPlus ? "Bersih, tanpa cap." : "Paket Basic: hasil unduhan memakai cap contoh."}</span>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            ["Perbaiki kalimat dengan AI", "AI membaca pengalamanmu lalu mengusulkan kalimat yang rapi."],
            ["Cek skor kecocokan lowongan", "AI menilai kecocokan isi CV dengan syarat lowongan."],
            ["Minta saran frasa", "AI memberi bullet siap pakai sesuai posisi."]
          ].map(([t, d]) => (
            <li key={t} className="rounded-lg border border-white/10 px-3 py-2 text-li-text">
              <span className="font-semibold">{t}</span> <span className="text-li-muted">(Plus)</span>
              <span className="block text-li-muted">{isPlus ? d : "Kunci pada paket Basic. Buka setelah upgrade."}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
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
          <a href={waLink("Halo Lamaranku, kuota 3 surat saya habis, saya mau upgrade Plus")} className={`${BTN} mt-3 inline-flex items-center bg-li-gold text-black`}>
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
