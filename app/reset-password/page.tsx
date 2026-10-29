"use client";
import { T, LocalizedAttributes } from "../../components/i18n/LanguageProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";
import "../../components/auth/bedim-reference.css";
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Tautan reset tidak valid atau kedaluwarsa. Minta tautan baru dari halaman login.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !/[\u0000-\u001f]/.test(next) ? next : "/dashboard"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Password belum dapat diperbarui."); }
    finally { setBusy(false); }
  }
  return <main className="bedim-page"><section className="login" style={{ gridTemplateColumns: "minmax(0, 400px)", justifyContent: "center" }}><div className="login__content" style={{ display: "block", padding: "3.5rem 1.5rem", borderRadius: "1.5rem" }}><h1 className="login__title"><T text={"Atur ulang password"} /></h1><form className="login__form" onSubmit={e => void submit(e)}><div className="login__group"><div className="login__box"><input id="new-password" type="password" autoComplete="new-password" required minLength={6} placeholder=" " className="login__input" value={password} onChange={e => setPassword(e.target.value)} /><label htmlFor="new-password" className="login__label"><T text={"Password baru"} /></label></div></div>{error && <p role="alert" className="login__message"><T text={error} /></p>}<button className="login__button" disabled={busy}><T text={busy ? "Sebentar…" : "Simpan password"} /></button><p className="login__sign"><a href="/masuk"><T text={"Kembali ke halaman masuk"} /></a></p></form></div></section></main>;
}
