"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, Gauge, BriefcaseBusiness, Mail, LogOut, ArrowUpRight } from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase/client";
export const tools = [
  { href: "/dashboard", title: "Ringkasan", description: "Ruang kerja lamaranmu", icon: LayoutDashboard },
  { href: "/dashboard/cv-builder", title: "CV Builder", description: "Susun, simpan, dan unduh CV profesional.", icon: FileText },
  { href: "/dashboard/skor", title: "Review CV", description: "Bedah kualitas CV dan kecocokan lowongan dengan AI.", icon: Gauge },
  { href: "/dashboard/portfolio", title: "Portofolio", description: "Tampilkan pengalaman dan karya terbaikmu.", icon: BriefcaseBusiness },
  { href: "/dashboard/surat", title: "Surat lamaran", description: "Siapkan surat untuk perusahaan tujuan.", icon: Mail },
];
export function DashboardShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname(); const router = useRouter();
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const current = tools.find(t => t.href === path) || tools[0];
  async function logout() {
    setBusy(true); setError("");
    try { const { error } = await supabaseBrowser().auth.signOut(); if (error) throw error; router.replace("/masuk"); router.refresh(); }
    catch { setError("Gagal keluar. Coba lagi."); setBusy(false); }
  }
  return <div className="min-h-screen bg-[#f6f7fb] text-zinc-900 lg:pl-64 print:bg-white print:pl-0">
    <aside className="border-b border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r print:hidden">
      <Link href="/" className="block px-6 py-7 text-2xl font-black tracking-tight">lamaranku<span className="text-blue-600">.</span></Link>
      <p className="hidden px-6 pb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 lg:block">Ruang kerja</p>
      <nav aria-label="Navigasi dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">{tools.map(t => <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${path === t.href ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}><t.icon size={19} />{t.title}</Link>)}</nav>
      <div className="hidden mt-auto p-5 lg:block"><div className="rounded-2xl bg-zinc-950 p-5 text-white"><p className="text-sm font-bold">Satu langkah lebih siap.</p><p className="mt-2 text-xs leading-5 text-zinc-400">Lengkapi dokumenmu, sesuaikan dengan pekerjaan yang kamu incar.</p></div></div>
    </aside>
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-4 lg:px-10 print:hidden"><div><p className="text-xs text-zinc-400">Dashboard / {current.title}</p><p className="mt-1 text-sm font-semibold">Ruang persiapan lamaran</p></div><div className="flex items-center gap-4"><span className="max-w-48 truncate text-xs text-zinc-500">{email}</span><button onClick={() => void logout()} disabled={busy} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"><LogOut size={15} />Keluar</button></div>{error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}</header>
    <main className="mx-auto max-w-[1600px] px-5 py-8 lg:p-10 print:p-0">{children}</main>
  </div>;
}
export function DashboardHome() {
  return <><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Langkah berikutnya</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Siapkan lamaran terbaikmu.</h1><p className="mt-3 max-w-xl text-zinc-500">Pilih alat yang kamu butuhkan. Semua proses persiapan lamaran ada di ruang kerja ini.</p><div className="mt-8 grid gap-5 md:grid-cols-2">{tools.slice(1).map(t => <Link key={t.href} href={t.href} className="group rounded-2xl border border-zinc-200 bg-white p-7 transition hover:border-blue-300 hover:shadow-sm"><div className="flex items-center justify-between"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><t.icon size={25} /></span><ArrowUpRight className="text-zinc-300 group-hover:text-blue-600" size={20} /></div><h2 className="mt-6 text-xl font-bold">{t.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{t.description}</p></Link>)}</div><p className="mt-6 text-xs text-zinc-400">CV dan portofolio saat ini disimpan di browser yang kamu gunakan, belum tersinkron antarperangkat.</p></>;
}
