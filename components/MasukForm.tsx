"use client";

import { useState } from "react";
import Link from "next/link";

const INPUT =
  "mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-[16px] text-zinc-900";

export function MasukForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-zinc-100 p-6 sm:p-8">
      {sent ? (
        <div role="status">
          <p className="font-bold text-zinc-900">Login belum aktif.</p>
          <p className="mt-1 text-sm text-zinc-600">
            Akun server menyusul. Datamu tetap tersimpan di peramban, lanjutkan tanpa daftar.
          </p>
          <Link
            href="/cv-builder"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Lanjut tanpa daftar
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim() !== "") setSent(true);
          }}
        >
          <label className="block text-sm font-bold">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
              inputMode="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="mt-3 block text-sm font-bold">
            Kata sandi
            <input type="password" className={INPUT} autoComplete="current-password" required />
          </label>
          <button
            type="submit"
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Masuk
          </button>
        </form>
      )}
    </div>
  );
}
