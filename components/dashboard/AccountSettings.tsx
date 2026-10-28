"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";
export function AccountSettings({ name, email }: { name: string; email: string }) {
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ data: { full_name: value.trim() } });
      if (error) throw error;
      setMessage("Nama profil berhasil disimpan."); router.refresh();
    } catch { setMessage("Profil belum tersimpan. Silakan coba lagi."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={event => void save(event)} className="max-w-lg space-y-5 rounded-2xl border border-zinc-200 bg-white p-6">
    <div><label htmlFor="account-name" className="mb-2 block text-sm font-semibold">Nama profil</label><input id="account-name" value={value} onChange={event => setValue(event.target.value)} autoComplete="name" required maxLength={100} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" /></div>
    <div><label htmlFor="account-email" className="mb-2 block text-sm font-semibold">Email akun</label><input id="account-email" value={email} readOnly className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500" /></div>
    {message && <p role="status" className="text-sm text-zinc-600">{message}</p>}
    <button disabled={busy} className="rounded-xl bg-[var(--appearance-accent,#3b63fb)] px-5 py-3 text-sm font-semibold text-[color:var(--appearance-on-accent,#fff)] disabled:opacity-50">{busy ? "Menyimpan…" : "Simpan perubahan"}</button>
  </form>;
}
