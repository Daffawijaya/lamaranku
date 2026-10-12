"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { supabaseBrowser } from "../lib/supabase/client";

const INPUT =
  "mt-1 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-[16px] text-zinc-900";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/cv-builder";
}

export function MasukForm() {
  const router = useRouter();
  const loader = useTopLoader();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [next, setNext] = useState("/cv-builder");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setNext(safeNext(q.get("next")));
    if (q.get("oauth_error")) setError("Login Google gagal. Coba lagi.");
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
      loader.start();
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

  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const { error } = await supabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login Google gagal. Coba lagi.");
      setBusy(false);
    }
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
              onClick={() => { loader.start(); router.replace(next); router.refresh(); }}
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

      <div className="relative my-4" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-zinc-100 px-3 text-xs text-zinc-500">atau</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void google()}
        disabled={busy}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-3 rounded-full border-2 border-zinc-900 bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.671 36 24 36c-5.173 0-9.625-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.57l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        Masuk dengan Google
      </button>
    </div>
  );
}
