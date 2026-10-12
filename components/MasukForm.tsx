"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { supabaseBrowser } from "../lib/supabase/client";

const FIELD =
  "h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#111827] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/cv-builder";
}

export function MasukForm() {
  const router = useRouter();
  const loader = useTopLoader();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <section className="flex min-h-screen items-center justify-center bg-white px-8 dark:bg-dark">
        <p className="text-sm text-[#6B7280] dark:text-neutral-400" role="status">Memeriksa sesi…</p>
      </section>
    );
  }

  if (loggedIn) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-white px-8 dark:bg-dark">
        <div className="w-full max-w-sm" role="status">
          <h1 className="text-[30px] font-semibold tracking-tight text-[#111827] dark:text-white">
            Sudah masuk
          </h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-neutral-400">{loggedIn}</p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => { loader.start(); router.replace(next); router.refresh(); }}
              className="h-11 w-full rounded-md bg-[#111827] text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
            >
              Lanjut
            </button>
            <button
              type="button"
              onClick={() => void keluar()}
              className="flex h-11 w-full items-center justify-center rounded-md border border-[#D1D5DB] bg-white text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
            >
              Keluar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-8 dark:bg-dark">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-[30px] font-semibold tracking-tight text-[#111827] dark:text-white">
            {mode === "masuk" ? "Masuk" : "Daftar"}
          </h1>

          <p className="mt-2 text-sm text-[#6B7280] dark:text-neutral-400">
            {mode === "masuk"
              ? "Selamat datang! Masukkan detail Anda."
              : "Buat akun untuk menyimpan berkas lamaranmu."}
          </p>
        </div>

        <form onSubmit={(e) => void submit(e)} className="space-y-5">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#374151] dark:text-neutral-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              placeholder="Masukkan email"
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#374151] dark:text-neutral-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Masukkan password"
                autoComplete={mode === "masuk" ? "current-password" : "new-password"}
                minLength={6}
                required
                onChange={(e) => setPassword(e.target.value)}
                className={`${FIELD} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-md bg-[#111827] text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {busy ? "Sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="relative py-1 pt-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB] dark:border-neutral-700" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-[#9CA3AF] dark:bg-dark dark:text-neutral-500">
              atau
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void google()}
          disabled={busy}
          className="mt-5 flex h-11 w-full items-center justify-center gap-3 rounded-md border border-[#D1D5DB] bg-white text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.145 35.091 26.671 36 24 36c-5.173 0-9.625-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.57l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Masuk dengan Google
        </button>

        <p className="pt-6 text-center text-sm text-[#6B7280] dark:text-neutral-400">
          {mode === "masuk" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); }}
            className="font-medium text-[#111827] transition hover:underline dark:text-white"
          >
            {mode === "masuk" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </section>
  );
}
