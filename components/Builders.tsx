"use client";

import { T, LocalizedAttributes } from "./i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { useAccountId } from "./dashboard/AccountContext";
import { accountStorageKey, readAccountValue, writeAccountValue } from "../lib/account-storage";
import { PLUS_PRICE } from "../data/features";
import { wa } from "../lib/wa";

const SURAT_KEY = "lamaranku_surat_count_v2";
const SURAT_MONTH_KEY = "lamaranku_surat_month";

const FIELD =
  "dash-ui-field w-full rounded-lg border border-[#b7b7b7] bg-white px-4 py-3 text-base text-[#2c2c2c] placeholder:text-[#6d6d6d] transition-colors hover:border-[#6d6d6d] focus:border-[var(--appearance-accent,#1473e6)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--appearance-accent,#1473e6)_20%,transparent)]";
const BTN_PRIMARY =
  "dash-ui-button dash-ui-button-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--appearance-accent,#3b63fb)] px-7 py-3 text-base font-bold text-[color:var(--appearance-on-accent,#fff)] transition-colors hover:bg-[var(--dash-blue-hover,#274dea)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--appearance-accent,#274dea)] disabled:opacity-40";
const BTN_SECONDARY =
  "dash-ui-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--appearance-line,#2c2c2c)] px-6 py-2.5 text-sm font-bold text-[color:var(--appearance-fg,#2c2c2c)] transition-colors hover:bg-[var(--control-selected-bg,#2c2c2c)] hover:text-[color:var(--control-selected-fg,#fff)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--control-selected-bg,#2c2c2c)]";

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
          <T text={"Mode: "} /><T text={isPlus ? "Plus" : "Basic"} />
        </span>
        {isPlus ? (
          <button onClick={downgradeDemo} className="underline"><T text={"Lihat sebagai Basic"} /></button>
        ) : (
          <button onClick={upgradeDemo} className="underline"><T text={"Lihat sebagai Plus"} /></button>
        )}
      </div>
      <SuratDemo isPlus={isPlus} />
    </div>
  );
}

export function SuratDemo({ isPlus }: { isPlus: boolean }) {
  const userId = useAccountId();
  const [nama, setNama] = useState("");
  const [perusahaan, setPerusahaan] = useState("");
  const [posisi, setPosisi] = useState("");
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    const draft = readAccountValue("lamaranku_surat_draft", userId) as Record<string, unknown> | null;
    if (draft && ["nama", "perusahaan", "posisi"].every(key => typeof draft[key] === "string")) {
      setNama(draft.nama as string); setPerusahaan(draft.perusahaan as string); setPosisi(draft.posisi as string);
    }
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    try {
      if (localStorage.getItem(accountStorageKey(SURAT_MONTH_KEY, userId)) !== month) {
        localStorage.setItem(accountStorageKey(SURAT_MONTH_KEY, userId), month);
        localStorage.setItem(accountStorageKey(SURAT_KEY, userId), "0");
      }
      const stored = Number(localStorage.getItem(accountStorageKey(SURAT_KEY, userId)));
      setCount(Number.isSafeInteger(stored) && stored >= 0 ? stored : 0);
    } catch {}
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    try { writeAccountValue("lamaranku_surat_draft", { nama, perusahaan, posisi }, userId); }
    catch { setDraftError("Draft belum tersimpan. Penyimpanan browser penuh atau diblokir."); }
  }, [nama, perusahaan, posisi, loaded, userId]);

  const limit = isPlus ? Infinity : 3;
  const lengkap = Boolean(nama.trim() && perusahaan.trim() && posisi.trim());
  const bisa = count < limit;

  const buat = () => {
    if (!loaded || !bisa || !lengkap) return;
    const next = count + 1;
    try {
      localStorage.setItem(accountStorageKey(SURAT_KEY, userId), String(next));
    } catch {}
    setCount(next);
  };

  return (
    <div className="letter-workspace grid items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <article className="border border-[#d8d8d8] bg-white">
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold"><T text={"Tujuan surat"} /></h3>
          <p className="mt-3 text-base leading-relaxed text-[#505050]">
            <T text={"Isi nama pengirim, perusahaan tujuan, dan posisi yang kamu lamar. "} /></p>
          {draftError && <p role="alert" className="mt-3 text-sm text-red-600"><T text={draftError} /></p>}
          <div className="mt-8 grid gap-5">
            <div>
              <label htmlFor="surat-nama" className="mb-2 block text-sm font-bold"><T text={"Nama pengirim"} /></label>
              <input id="surat-nama" value={nama} onChange={(e) => setNama(e.target.value)} className={FIELD} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="surat-perusahaan" className="mb-2 block text-sm font-bold"><T text={"Perusahaan tujuan"} /></label>
              <input id="surat-perusahaan" value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} className={FIELD} />
            </div>
            <div>
              <label htmlFor="surat-posisi" className="mb-2 block text-sm font-bold"><T text={"Posisi yang dilamar"} /></label>
              <input id="surat-posisi" value={posisi} onChange={(e) => setPosisi(e.target.value)} className={FIELD} />
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#606060]" role="status">
            <T text={loaded ? `Surat bulan ini: ${count} dari ${isPlus ? "tanpa batas" : "3 surat"}. Kuota ulang tiap awal bulan.` : "Memuat kuota..."} />
          </p>
          <button onClick={buat} disabled={!loaded || !bisa || !lengkap} className={`${BTN_PRIMARY} mt-5 w-full`}>
            <T text={bisa ? "Buat surat" : "Kuota Basic habis"} />
          </button>
          {!bisa && (
            <a href={wa("Halo Lamaranku, kuota 3 surat saya habis, saya mau upgrade Plus")} className={`${BTN_SECONDARY} mt-3 w-full`}>
              <T text={"Minta link bayar Plus "} /></a>
          )}
        </div>
      </article>
      <article className="border border-[#d8d8d8] bg-white">
        <div className="p-6 sm:p-8">
          <h3 className="text-2xl font-extrabold"><T text={"Bacaan surat"} /></h3>
          <div data-document-preview className="letter-preview mt-6 rounded-lg bg-[#f5f5f5] p-5 text-sm leading-relaxed sm:text-base">
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
            {!isPlus && <p className="mt-3 border-t border-black/15 pt-2 text-xs text-[#606060]">Dibuat dengan paket Basic Lamaranku.</p>}
          </div>
        </div>
      </article>
    </div>
  );
}
