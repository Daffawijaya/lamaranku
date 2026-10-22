"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { gsap } from "gsap";
import { RiMailFill, RiLock2Fill, RiSendPlane2Fill, RiGoogleFill } from "react-icons/ri";
import { supabaseBrowser } from "../lib/supabase/client";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value)) return value;
  return "/dashboard";
}

export function MasukForm() {
  const root = useRef<HTMLElement>(null);
  const router = useRouter();
  const loader = useTopLoader();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [next, setNext] = useState("/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.fromTo(".login__content", { y: -800, scaleX: .2, scaleY: .5, opacity: 0 }, { y: 0, scaleX: .2, scaleY: .5, opacity: 1, duration: 1.5, ease: "power3.out" })
          .to(".login__content", { scaleY: 1, duration: .6, ease: "power3.out" }, "-=0.3")
          .to(".login__content", { scaleX: 1, duration: .7, ease: "power3.out" }, "-=0.2")
          .to(".login__img", { scale: 1.08, duration: 5, ease: "power1.inOut", repeat: -1, yoyo: true, transformOrigin: "center center" });
        gsap.from(".login__title", { opacity: 0, y: -60, ease: "power2.out", duration: 1.2, delay: 2.5 });
        gsap.from(".login__form > *", { opacity: 0, y: -60, ease: "power2.out", duration: 1.2, delay: 2.7, stagger: .2 });
        gsap.from(".login__img", { opacity: 0, y: 0, x: 100, duration: 1.2, delay: 3.2, ease: "elastic.out(1,0.6)" });
      });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setNext(safeNext(q.get("next")));
    if (q.get("oauth_error")) setError("Login Google gagal. Coba lagi.");
    let alive = true;
    void (async () => {
      try {
        const { data, error } = await supabaseBrowser().auth.getUser();
        if (!alive) return;
        if (error && error.name !== "AuthSessionMissingError") setError("Pemeriksaan sesi gagal. Silakan coba login.");
        setLoggedIn(data.user?.email ?? null);
      } catch { if (alive) setError("Tidak dapat terhubung ke layanan login."); }
      finally { if (alive) setChecking(false); }
    })();
    return () => { alive = false; };
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
      if (!data.session) {
        setError("Akun dibuat. Periksa email untuk konfirmasi, lalu masuk kembali untuk melanjutkan.");
        return;
      }
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
    setBusy(true); setError("");
    try {
      const { error } = await supabaseBrowser().auth.signOut();
      if (error) throw error;
      setLoggedIn(null); router.refresh();
    } catch { setError("Gagal keluar. Coba lagi."); }
    finally { setBusy(false); }
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


  const forgot = async () => {
    if (!email.trim()) { setError("Isi email terlebih dahulu untuk menerima tautan reset password."); return; }
    setBusy(true); setError("");
    try {
      const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent("/reset-password?next=" + encodeURIComponent(next)),
      });
      if (error) throw error;
      setError("Jika email terdaftar, tautan reset password telah dikirim. Periksa kotak masukmu.");
    } catch { setError("Tautan reset belum dapat dikirim. Coba lagi nanti."); }
    finally { setBusy(false); }
  };

  return <section ref={root} className="login" aria-label="Login Lamaranku">
    <div className="login__content">
      <div>
        <h1 className="login__title">{loggedIn ? "Sudah masuk" : mode === "masuk" ? "Selamat datang" : "Buat akun"}</h1>
        <form onSubmit={e => void submit(e)} className="login__form" aria-busy={busy || checking}>
          <div className="login__group">
            <div className="login__box">
              <RiMailFill className="login__icon" aria-hidden="true" />
              <input id="login-email" className="login__input" type="email" name="email" autoComplete="email" required placeholder=" " value={email} onChange={e => setEmail(e.target.value)} disabled={busy || Boolean(loggedIn)} />
              <label htmlFor="login-email" className="login__label">Email</label>
            </div>
            <div className="login__box">
              <RiLock2Fill className="login__icon" aria-hidden="true" />
              <input id="login-password" className="login__input" type={showPassword ? "text" : "password"} name="password" autoComplete={mode === "masuk" ? "current-password" : "new-password"} required minLength={6} placeholder=" " value={password} onChange={e => setPassword(e.target.value)} disabled={busy || Boolean(loggedIn)} />
              <label htmlFor="login-password" className="login__label">Password</label>
              <button type="button" className="login__password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="button" className="login__forgot" onClick={() => void forgot()} disabled={busy || checking}>Lupa password?</button>
          {error && <p className="login__message" role="alert">{error}</p>}
          {checking && <p className="login__status" role="status">Memeriksa sesi…</p>}
          {loggedIn ? <button type="button" className="login__button" onClick={() => { loader.start(); router.replace(next); router.refresh(); }}>Lanjut <RiSendPlane2Fill size={24} /></button> : <button type="submit" className="login__button" disabled={busy || checking}>{busy ? "Sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"}<RiSendPlane2Fill size={24} aria-hidden="true" /></button>}
          <p className="login__sign">{loggedIn ? loggedIn + " · " : mode === "masuk" ? "Belum punya akun? " : "Sudah punya akun? "}<button type="button" disabled={busy || checking} onClick={() => { if (loggedIn) { void keluar(); return; } setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); }}>{loggedIn ? "Keluar" : mode === "masuk" ? "Daftar" : "Masuk"}</button></p>
          {!loggedIn && <button type="button" className="login__google" onClick={() => void google()} disabled={busy || checking}><RiGoogleFill size={19} aria-hidden="true" />Masuk dengan Google</button>}
        </form>
      </div>
      <div className="login__image"><img src="https://images.pexels.com/photos/7718662/pexels-photo-7718662.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Buku catatan dan alat tulis untuk menyiapkan lamaran" className="login__img" fetchPriority="high" /></div>
    </div>
  </section>;
}
