"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { WA_NUMBER, PLUS_PRICE } from "../data/features";

const wa = (t: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

const ITEMS = [
  { t: "Kontak lengkap", d: "Email dan nomor HP aktif tertulis di atas." },
  { t: "Satu kolom", d: "Tanpa tabel, kolom ganda, grafik, atau header aneh." },
  { t: "Font standar", d: "Arial, Calibri, Georgia, atau Times. Bukan dekoratif." },
  { t: "Judul bagian jelas", d: "Ada Pengalaman, Pendidikan, dan Keahlian." },
  { t: "Angka hasil", d: "Pengalaman menyebut angka: jumlah, persen, atau waktu." },
  { t: "Keyword lowongan", d: "Skill di CV sama dengan kata di lowongan yang dituju." },
  { t: "Satu bahasa", d: "Full Indonesia atau full Inggris, tidak campur." },
  { t: "Maksimal 2 halaman", d: "Fresh graduate cukup 1 halaman." },
  { t: "Format PDF", d: "Bukan foto, bukan doc yang berantakan." },
  { t: "Skill spesifik", d: "Tertulis skill teknis, bukan cuma kerja keras dan jujur." },
];

export function SkorChecker() {
  const [checked, setChecked] = useState<boolean[]>(() => ITEMS.map(() => false));
  const done = checked.filter(Boolean).length;
  const score = Math.round((done / ITEMS.length) * 100);
  const verdict =
    done === 0
      ? "Centang yang sudah dipenuhi CV-mu."
      : score < 50
        ? "Perlu banyak perbaikan sebelum dikirim."
        : score < 80
          ? "Cukup. Poles bagian yang belum dicentang."
          : "Siap kirim. Tinggal sesuaikan keyword per lowongan.";

  return (
    <div>
      <div className="rounded-2xl bg-zinc-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-600">Skor cek mandiri</p>
            <p className="text-5xl font-black tracking-tight text-zinc-900 sm:text-6xl" role="status">
              {score}
              <span className="text-2xl text-zinc-400">/100</span>
            </p>
          </div>
          <p className="max-w-sm text-sm text-zinc-600">{verdict}</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
          <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${score}%` }} />
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {ITEMS.map((item, i) => (
          <li key={item.t}>
            <button
              type="button"
              aria-pressed={checked[i]}
              onClick={() =>
                setChecked((c) => c.map((v, x) => (x === i ? !v : v)))
              }
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                checked[i] ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                  checked[i] ? "border-white bg-white text-black" : "border-zinc-300 text-transparent"
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span>
                <span className="block font-bold">{item.t}</span>
                <span className={`mt-0.5 block text-sm ${checked[i] ? "text-white/70" : "text-zinc-600"}`}>{item.d}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-[#191919] p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Plus</p>
        <p className="mt-2 text-xl font-bold">Mau dinilai otomatis?</p>
        <p className="mt-1 text-sm text-gray-400">
          AI Plus memeriksa CV-mu dan memberi saran perbaikan instan. Segera hadir di paket {PLUS_PRICE}.
        </p>
        <a
          href={wa("Halo Lamaranku, saya mau info cek skor otomatis Plus")}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#1473E6] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Tanya info Plus
        </a>
      </div>
    </div>
  );
}
