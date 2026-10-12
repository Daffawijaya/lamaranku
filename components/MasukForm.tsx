"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../lib/supabase/client";

const INPUT =
  "mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-[16px] text-zinc-900";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/cv-builder";
}

export function MasukForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [next, setNext] = useState("/cv-builder");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setNext(safeNext(new URLSearchParams(window.location.search).get("next")));
    supabaseBrowser().auth.getUser().then(({ data }) => {
      setLoggedIn(data.user?.email ?? null);
      setChecking(false);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = supabaseBrowser();
      const { data, error: authError } =
        mode === "masuk"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({ email: email.trim(), password });
      if (authError) throw authError;
      if (data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id }, { onConflict: "id" });
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const keluar = async () => {
    await supabaseBrowser().auth.signOut();
    setLoggedIn(null);
    router.refresh();
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-zinc-100 p-6 sm:p-8" role="status">
        <p className="text-sm text-zinc-600">Memeriksa sesi…</p>
      </div>
    );
  }

  if (loggedIn) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-zinc-100 p-6 sm:p-8">
        <div role="status">
          <p className="font-bold text-zinc-900">Sudah masuk sebagai {loggedIn}.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => { router.replace(next); router.refresh(); }}
              className="inline-flex min-h-[44px] items-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Lanjut
            </button>
            <button
              type="button"
              onClick={() => void keluar()}
              className="inline-flex min-h-[44px] items-center rounded-full border-2 border-zinc-900 px-8 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-zinc-100 p-6 sm:p-8">
      <form onSubmit={(e) => void submit(e)}>
        <label className="block text-sm font-bold">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="mt-3 block text-sm font-bold">
          Kata sandi
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className={INPUT}
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>
        {error && <p className="mt-3 text-sm font-bold text-red-700" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
        >
          {busy ? "Sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); }}
        className="mt-3 w-full text-center text-sm font-bold text-zinc-900 underline underline-offset-2"
      >
        {mode === "masuk" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
    </div>
  );
}
