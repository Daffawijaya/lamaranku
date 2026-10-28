"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Download, Folder, Palette, Search, Settings, Shield, UserCircle, Wallet } from "lucide-react";
import { useAccountId } from "./AccountContext";
import { AccountSettings } from "./AccountSettings";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import { loadSaved } from "../../lib/cv";
import { DEFAULT_PREFERENCES, readDashboardPreferences, type DashboardPreferences } from "../../lib/dashboard-preferences";
import "./settings.css";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: UserCircle },
  { id: "storage", label: "Storage", icon: Folder },
  { id: "billing", label: "Usage & billing", icon: Wallet },
  { id: "data", label: "Data controls", icon: Shield },
] as const;
type Section = typeof sections[number]["id"];


function Row({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="settings-row"><div className="settings-row-copy"><h3>{title}</h3>{description && <p>{description}</p>}</div><div className="settings-row-control">{children}</div></div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} className="settings-switch" onClick={() => onChange(!checked)}><span /></button>;
}

export function SettingsWorkspace({ name, email }: { name: string; email: string }) {
  const userId = useAccountId();
  const [section, setSection] = useState<Section>("general");
  const [search, setSearch] = useState("");
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const [usage, setUsage] = useState({ bytes: 0, keys: 0, cvs: 0 });
  const title = sections.find(item => item.id === section)!.label;
  const filtered = useMemo(() => sections.filter(item => item.label.toLowerCase().includes(search.trim().toLowerCase())), [search]);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("section");
    if (sections.some(item => item.id === initial)) setSection(initial as Section);
    setPreferences(readDashboardPreferences(userId));
    setExpanded(readAccountValue("lamaranku_sidebar_expanded", userId) === true);
  }, [userId]);
  useEffect(() => {
    let bytes = 0, keys = 0;
    try {
      const suffix = ":user:" + encodeURIComponent(userId ?? "");
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.endsWith(suffix)) { bytes += new Blob([localStorage.getItem(key) ?? ""]).size; keys++; }
      }
      setUsage({ bytes, keys, cvs: loadSaved(userId).length });
    } catch { setNotice("Informasi penyimpanan browser belum dapat dibaca."); }
  }, [userId, section]);

  function select(next: Section) {
    setSection(next); setNotice("");
    const url = new URL(window.location.href); url.searchParams.set("section", next);
    window.history.replaceState(null, "", url.pathname + url.search);
  }
  function save(next: DashboardPreferences) {
    try {
      writeAccountValue("lamaranku_dashboard_preferences", next, userId);
      setPreferences(next); setNotice("");
      window.dispatchEvent(new Event("lamaranku:preferences"));
    } catch { setNotice("Pengaturan belum tersimpan. Penyimpanan browser diblokir atau penuh."); }
  }
  function sidebar(value: boolean) {
    try {
      writeAccountValue("lamaranku_sidebar_expanded", value, userId); setExpanded(value);
      window.dispatchEvent(new Event("lamaranku:preferences"));
    } catch { setNotice("Pengaturan sidebar belum tersimpan."); }
  }
  function exportData() {
    try {
      const suffix = ":user:" + encodeURIComponent(userId ?? "");
      const records: Record<string, unknown> = {};
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith("lamaranku_") && key.endsWith(suffix)) records[key.slice(0, -suffix.length)] = JSON.parse(localStorage.getItem(key) ?? "null");
      }
      const url = URL.createObjectURL(new Blob([JSON.stringify({ application: "Lamaranku", version: 1, exportedAt: new Date().toISOString(), records }, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "lamaranku-data.json"; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Salinan data akun di browser ini berhasil diunduh.");
    } catch { setNotice("Data belum dapat diunduh."); }
  }

  return <div className="settings-workspace">
    <aside className="settings-sidebar" aria-label="Navigasi pengaturan">
      <h1>Settings</h1>
      <div className="settings-search"><Search size={15} /><input aria-label="Cari pengaturan" placeholder="Search" value={search} onChange={event => setSearch(event.target.value)} /></div>
      <nav><p className="settings-group-label">Personal</p>{filtered.map(item => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} onClick={() => select(item.id)}><item.icon /><span>{item.label}</span>{item.id === "profile" && <ArrowUpRight className="settings-nav-arrow" />}</button>)}{filtered.length === 0 && <p className="settings-search-empty">Pengaturan tidak ditemukan.</p>}<p className="settings-group-label settings-group-secondary">Lamaranku</p><Link href="/dashboard"><Folder /><span>Kembali ke dashboard</span></Link><Link href="/#cara-kerja"><Shield /><span>Panduan penggunaan</span><ArrowUpRight className="settings-nav-arrow" /></Link></nav>
    </aside>
    <div className="settings-content" key={section}>
      <div className="settings-content-inner">
        <h2>{title}</h2>
        {section === "general" && <>
          <section className="settings-section"><h3>Workspace</h3><div className="settings-card">
            <Row title="Sidebar diperlebar" description="Tampilkan nama fitur di samping ikon navigasi dashboard."><Toggle label="Sidebar diperlebar" checked={expanded} onChange={sidebar} /></Row>
            <Row title="Konfirmasi sebelum keluar" description="Tanyakan konfirmasi sebelum keluar dari akun Lamaranku."><Toggle label="Konfirmasi sebelum keluar" checked={preferences.confirmLogout} onChange={value => save({ ...preferences, confirmLogout: value })} /></Row>
          </div></section>
          <section className="settings-section"><h3>General</h3><div className="settings-card">
            <Row title="Penyimpanan dokumen" description="Draft dan dokumen dipisahkan berdasarkan akun pada browser yang kamu gunakan."><span className="settings-value">Browser ini</span></Row>
            <Row title="Kepadatan tampilan" description="Atur ruang di sekitar konten dashboard."><select aria-label="Kepadatan tampilan" value={preferences.compact ? "compact" : "comfortable"} onChange={event => save({ ...preferences, compact: event.target.value === "compact" })}><option value="comfortable">Nyaman</option><option value="compact">Ringkas</option></select></Row>
            <Row title="Animasi" description="Kurangi gerakan transisi pada dashboard."><select aria-label="Animasi dashboard" value={preferences.reduceMotion ? "reduced" : "system"} onChange={event => save({ ...preferences, reduceMotion: event.target.value === "reduced" })}><option value="system">Ikuti sistem</option><option value="reduced">Kurangi gerakan</option></select></Row>
            <Row title="Bahasa" description="Bahasa konten dan formulir aplikasi."><span className="settings-value">Bahasa Indonesia</span></Row>
          </div></section>
        </>}
        {section === "profile" && <section className="settings-section"><h3>Profil publik</h3><p className="settings-section-description">Nama ini ditampilkan pada menu profil dan dashboard.</p><AccountSettings name={name} email={email} /></section>}
        {section === "appearance" && <section className="settings-section"><h3>Appearance</h3><div className="settings-card"><Row title="Tema" description="Tampilan terang dengan aksen biru Lamaranku."><span className="settings-value">Light</span></Row><Row title="Tampilan ringkas" description="Gunakan jarak konten yang lebih rapat di dashboard."><Toggle label="Tampilan ringkas" checked={preferences.compact} onChange={value => save({ ...preferences, compact: value })} /></Row><Row title="Kurangi gerakan" description="Matikan animasi dan transisi pada dashboard."><Toggle label="Kurangi gerakan" checked={preferences.reduceMotion} onChange={value => save({ ...preferences, reduceMotion: value })} /></Row></div></section>}
        {section === "account" && <section className="settings-section"><h3>Informasi akun</h3><div className="settings-card"><Row title="Email" description="Alamat email yang digunakan untuk masuk."><span className="settings-value">{email}</span></Row><Row title="Nama profil" description={name || "Belum diisi"}><button className="settings-control" onClick={() => select("profile")}>Ubah</button></Row></div></section>}
        {section === "storage" && <section className="settings-section"><h3>Storage</h3><div className="settings-card"><Row title="CV tersimpan" description="Dokumen milik akunmu di browser ini."><span className="settings-value">{usage.cvs} dokumen</span></Row><Row title="Penyimpanan lokal" description="Ukuran draft, dokumen, dan preferensi akun di browser ini."><span className="settings-value">{(usage.bytes / 1024).toFixed(1)} KB</span></Row><Row title="Sinkronisasi antarperangkat" description="Data lokal belum tersinkron ke perangkat lain."><span className="settings-value">Belum tersedia</span></Row></div></section>}
        {section === "billing" && <section className="settings-section"><h3>Paket dan penggunaan</h3><div className="settings-card"><Row title="Dokumen CV" description="Jumlah dokumen yang disimpan akunmu di browser ini."><span className="settings-value">{usage.cvs} CV</span></Row><Row title="Paket Lamaranku" description="Lihat fitur Basic dan Plus beserta harga yang berlaku."><Link className="settings-control" href="/harga">Lihat paket <ArrowUpRight size={13} /></Link></Row></div></section>}
        {section === "data" && <section className="settings-section"><h3>Data controls</h3><div className="settings-card"><Row title="Ekspor data akun" description="Unduh salinan dokumen, draft, dan preferensi akun yang tersimpan di browser ini. Token login tidak disertakan."><button className="settings-control" onClick={exportData}><Download size={13} />Ekspor</button></Row><Row title="Pemisahan data" description="Dokumen akun lain dan simpanan lama tanpa pemilik tidak dimasukkan ke salinan data ini."><Shield size={17} /></Row></div></section>}
        {notice && <p role="status" className="settings-notice">{notice}</p>}
      </div>
    </div>
  </div>;
}
