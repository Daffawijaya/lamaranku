"use client";

import { T, LocalizedAttributes } from "./i18n/LanguageProvider";
import { Check, Eye, EyeOff } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RiMailFill, RiLock2Fill, RiSendPlane2Fill, RiGoogleFill } from "react-icons/ri";
import { supabaseBrowser } from "../lib/supabase/client";

function safeNext(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/[\u0000-\u001f]/.test(value)) return value;
  return "/dashboard";
}

function authErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (/failed to fetch|fetch failed|networkerror|network request failed|load failed/i.test(message)) {
    return "Tidak dapat terhubung ke layanan akun. Periksa koneksi internet. Jika tetap gagal, pengelola perlu memeriksa Project URL dan status proyek Supabase.";
  }
  return message || fallback;
}

export function MasukForm() {
  const root = useRef<HTMLElement>(null);
  const restoreToggleFocus = useRef(false);
  const reducedMotion = useReducedMotion();
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const loader = useTopLoader();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [next, setNext] = useState("/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<{ userId: string; id: string } | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmationEmail || !pendingConfirmation || emailConfirmed) return;
    let disposed = false;
    let checkingStatus = false;
    const check = async () => {
      if (checkingStatus || document.visibilityState === "hidden") return;
      checkingStatus = true;
      try {
        const { data, error } = await supabaseBrowser().rpc("signup_confirmation_status", {
          p_user_id: pendingConfirmation.userId,
          p_confirmation_id: pendingConfirmation.id,
        });
        if (!disposed && !error && data === true) setEmailConfirmed(true);
      } catch { /* Retry after a temporary connection failure. */ }
      finally { checkingStatus = false; }
    };
    void check();
    const timer = window.setInterval(() => void check(), 5000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [confirmationEmail, pendingConfirmation, emailConfirmed]);

  useEffect(() => {
    if (!emailConfirmed) return;
    const timer = window.setTimeout(() => {
      setConfirmationEmail(null);
      setPendingConfirmation(null);
      setMode("masuk");
      setError("");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [emailConfirmed]);

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
    const destination = safeNext(q.get("next"));
    setNext(destination);
    if (q.get("oauth_error")) setError("Login Google gagal. Coba lagi.");
    let alive = true;
    let redirecting = false;
    void (async () => {
      try {
        const { data, error } = await supabaseBrowser().auth.getUser();
        if (!alive) return;
        if (error && error.name !== "AuthSessionMissingError") setError("Pemeriksaan sesi gagal. Silakan coba login.");
        if (data.user) {
          redirecting = true;
          router.replace(destination);
          router.refresh();
        }
      } catch { if (alive) setError("Tidak dapat terhubung ke layanan login."); }
      finally { if (alive && !redirecting) setChecking(false); }
    })();
    return () => { alive = false; };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "daftar" && password !== confirmPassword) {
      setError("Konfirmasi password harus sama dengan password.");
      root.current?.querySelector<HTMLInputElement>("#login-confirm-password")?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const supabase = supabaseBrowser();
      const confirmationId = crypto.randomUUID();
      const { data, error: authError } =
        mode === "masuk"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({ email: email.trim(), password, options: {
              data: { confirmation_id: confirmationId },
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
            } });
      if (authError) throw authError;
      if (!data.session) {
        if (mode === "daftar") {
          setEmailConfirmed(false);
          setPendingConfirmation(data.user ? { userId: data.user.id, id: confirmationId } : null);
          setConfirmationEmail(email.trim());
          setPassword("");
          setConfirmPassword("");
          setShowPassword(false);
          setShowConfirmPassword(false);
        } else {
          setError("Sesi login belum tersedia. Silakan masuk kembali.");
        }
        return;
      }
      if (data.user) {
        await supabase.from("profiles").upsert({ id: data.user.id }, { onConflict: "id" });
      }
      loader.start();
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err, "Gagal masuk. Coba lagi."));
    } finally {
      setBusy(false);
    }
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
      setError(authErrorMessage(err, "Login Google gagal. Coba lagi."));
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

  const switchMode = () => {
    if (busy || checking || switching) return;
    restoreToggleFocus.current = true;
    setSwitching(true);
    setMode(current => current === "masuk" ? "daftar" : "masuk");
    setError("");
    setShowPassword(false);
    setConfirmPassword("");
    setShowConfirmPassword(false);
  };

  return <LocalizedAttributes><section ref={root} className="login" aria-label="Login Lamaranku">
    <div className="login__content">
      <div className="login__panel">
      <AnimatePresence mode="wait" initial={false}>
      <motion.div key={confirmationEmail ? "periksa-email" : mode}
        initial={{ opacity: 0, x: reducedMotion ? 0 : mode === "daftar" ? 22 : -22 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: reducedMotion ? 0 : mode === "masuk" ? -22 : 22 }}
        transition={{ duration: reducedMotion ? 0 : .22, ease: [.22, 1, .36, 1] }}
        onAnimationComplete={(definition) => {
          if (typeof definition !== "object" || !("opacity" in definition) || definition.opacity !== 1) return;
          setSwitching(false);
          if (restoreToggleFocus.current) {
            restoreToggleFocus.current = false;
            requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>("[data-mode-toggle]")?.focus({ preventScroll: true }));
          }
        }}>

        {confirmationEmail ? <div className="login__confirmation">
          <div role="status" aria-live="polite" className="login__confirmation-content">
            <span className="login__confirmation-icon">{emailConfirmed ? <Check size={28} aria-hidden="true" /> : <RiMailFill size={28} aria-hidden="true" />}</span>
            <h1 className="login__confirmation-title" tabIndex={-1} ref={node => node?.focus()}><T text={emailConfirmed ? "Email sudah dikonfirmasi" : "Periksa email kamu"} /></h1>
            <p className="login__confirmation-copy"><T text={emailConfirmed ? "Akun dengan email berikut sudah aktif" : "Tautan konfirmasi akun telah dikirim ke"} /></p>
            <strong className="login__confirmation-email">{confirmationEmail}</strong>
            <p className="login__confirmation-copy"><T text={emailConfirmed ? "Sebentar, kamu akan kembali ke halaman login secara otomatis…" : "Klik tautan di email untuk mengaktifkan akun. Halaman ini akan diperbarui otomatis setelah konfirmasi."} /></p>
          </div>
          <button type="button" className="login__button" onClick={() => { setConfirmationEmail(null); setPendingConfirmation(null); setMode("masuk"); setError(""); }}><T text={"Kembali ke login "} /><RiSendPlane2Fill size={24} aria-hidden="true" /></button>
        </div> : <>
        <h1 className="login__title"><T text={mode === "masuk" ? "Selamat datang" : "Buat akun"} /></h1>
        <form onSubmit={e => void submit(e)} className="login__form" aria-busy={busy || checking || switching}>
          <div className="login__group">
            <div className="login__box">
              <RiMailFill className="login__icon" aria-hidden="true" />
              <input id="login-email" className="login__input" type="email" name="email" autoComplete="email" required placeholder=" " value={email} onChange={e => setEmail(e.target.value)} disabled={busy || checking} />
              <label htmlFor="login-email" className="login__label"><T text={"Email"} /></label>
            </div>
            <div className="login__box">
              <RiLock2Fill className="login__icon" aria-hidden="true" />
              <input id="login-password" className="login__input" type={showPassword ? "text" : "password"} name="password" autoComplete={mode === "masuk" ? "current-password" : "new-password"} required minLength={6} placeholder=" " value={password} onChange={e => setPassword(e.target.value)} disabled={busy || checking} />
              <label htmlFor="login-password" className="login__label"><T text={"Password"} /></label>
              <LocalizedAttributes><button type="button" className="login__password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></LocalizedAttributes>
            </div>
            {mode === "daftar" && <div className="login__box">
              <RiLock2Fill className="login__icon" aria-hidden="true" />
              <input id="login-confirm-password" className="login__input" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" required minLength={6} placeholder=" " value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={busy || checking} />
              <label htmlFor="login-confirm-password" className="login__label"><T text={"Konfirmasi password"} /></label>
              <LocalizedAttributes><button type="button" className="login__password-toggle" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"} aria-pressed={showConfirmPassword}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></LocalizedAttributes>
            </div>}
          </div>
          {mode === "masuk" && <button type="button" className="login__forgot" onClick={() => void forgot()} disabled={busy || checking}><T text={"Lupa password?"} /></button>}
          {error && <p className="login__message" role="alert"><T text={error} /></p>}
          {checking && <p className="login__status" role="status"><T text={"Memeriksa sesi…"} /></p>}
          <button type="submit" className="login__button" disabled={busy || checking}><T text={busy ? "Sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"} /><RiSendPlane2Fill size={24} aria-hidden="true" /></button>
          <p className="login__sign"><T text={mode === "masuk" ? "Belum punya akun? " : "Sudah punya akun? "} /><button data-mode-toggle type="button" disabled={busy || checking || switching} onClick={switchMode}><T text={mode === "masuk" ? "Daftar" : "Masuk"} /></button></p>
          <button type="button" className="login__google" onClick={() => void google()} disabled={busy || checking}><RiGoogleFill size={19} aria-hidden="true" /><T text={"Masuk dengan Google"} /></button>
        </form>
        </>}
      </motion.div>
      </AnimatePresence>
      </div>
      <div className="login__image"><LocalizedAttributes><img src="https://images.pexels.com/photos/7718662/pexels-photo-7718662.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Buku catatan dan alat tulis untuk menyiapkan lamaran" className="login__img" fetchPriority="high" /></LocalizedAttributes></div>
    </div>
  </section></LocalizedAttributes>;
}
