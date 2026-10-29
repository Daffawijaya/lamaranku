"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Download, Folder, Palette, Search, Settings, Shield, UserCircle, Wallet } from "lucide-react";
import { useAccountId } from "./AccountContext";
import { AppearanceSettings } from "./AppearanceSettings";
import { APPEARANCE_KEY, DEFAULT_APPEARANCE, readAppearance, normalizeAppearance, type Appearance } from "../../lib/appearance";
import { ProfileWorkspace } from "./ProfileWorkspace";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import { loadSaved } from "../../lib/cv";
import { DEFAULT_PREFERENCES, readDashboardPreferences, type DashboardPreferences } from "../../lib/dashboard-preferences";
import { Dropdown } from "../ui/Dropdown";
import { SETTINGS_LANGUAGES, resolveSettingsLanguage, settingsTranslator } from "../../lib/settings-language";
import "./settings.css";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "storage", label: "Storage", icon: Folder },
  { id: "billing", label: "Usage & billing", icon: Wallet },
  { id: "data", label: "Data controls", icon: Shield },
] as const;
type Section = typeof sections[number]["id"];


function Row({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className="settings-row"><div className="settings-row-copy"><h3><T text={title} /></h3>{description && <p><T text={description} /></p>}</div><div className="settings-row-control">{children}</div></div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <LocalizedAttributes><button type="button" role="switch" aria-label={label} aria-checked={checked} className="settings-switch" onClick={() => onChange(!checked)}><span /></button></LocalizedAttributes>;
}

export function SettingsWorkspace({ name, email, avatarUrl = "", username = "" }: { name: string; email: string; avatarUrl?: string; username?: string }) {
  const userId = useAccountId();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const section: Section = requestedSection === "account" ? "profile" : sections.some(item => item.id === requestedSection) ? requestedSection as Section : "general";
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [search, setSearch] = useState("");
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [browserLanguage, setBrowserLanguage] = useState("id");
  const language = resolveSettingsLanguage(preferences.language ?? "id", browserLanguage);
  const t = useMemo(() => settingsTranslator(language), [language]);
  useEffect(() => {
    const sync = () => setBrowserLanguage(navigator.language);
    sync(); window.addEventListener("languagechange", sync);
    return () => window.removeEventListener("languagechange", sync);
  }, []);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const [usage, setUsage] = useState({ bytes: 0, keys: 0, cvs: 0 });
  const title = sections.find(item => item.id === section)!.label;
  const filtered = useMemo(() => sections.filter(item => t(item.label).toLowerCase().includes(search.trim().toLowerCase())), [search, t]);

  useEffect(() => {
    setPreferences(readDashboardPreferences(userId));
    setExpanded(readAccountValue("lamaranku_sidebar_expanded", userId) === true);
  }, [userId]);
  useEffect(() => {
    const sync = () => setAppearance(readAppearance(userId));
    sync();
    window.addEventListener("lamaranku:appearance", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lamaranku:appearance", sync);
      window.removeEventListener("storage", sync);
    };
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
    } catch { setNotice(t("Informasi penyimpanan browser belum dapat dibaca.")); }
  }, [userId, section, t]);

  function select(next: Section) {
    setNotice("");
    const url = new URL(window.location.href); url.searchParams.set("section", next);
    window.history.replaceState(null, "", url.pathname + url.search);
  }
  function save(next: DashboardPreferences) {
    try {
      writeAccountValue("lamaranku_dashboard_preferences", next, userId);
      setPreferences(next); setNotice("");
      window.dispatchEvent(new Event("lamaranku:preferences"));
    } catch { setNotice(t("Pengaturan belum tersimpan. Penyimpanan browser diblokir atau penuh.")); }
  }
  function saveAppearance(next: Appearance) {
    try {
      const validated = normalizeAppearance(next);
      writeAccountValue(APPEARANCE_KEY, validated, userId); setAppearance(validated); setNotice("");
      window.dispatchEvent(new Event("lamaranku:appearance"));
    } catch { setNotice(t("Tema belum tersimpan. Penyimpanan browser diblokir atau penuh.")); }
  }
  function sidebar(value: boolean) {
    try {
      writeAccountValue("lamaranku_sidebar_expanded", value, userId); setExpanded(value);
      window.dispatchEvent(new Event("lamaranku:preferences"));
    } catch { setNotice(t("Pengaturan sidebar belum tersimpan.")); }
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
      window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice(t("Salinan data akun di browser ini berhasil diunduh."));
    } catch { setNotice(t("Data belum dapat diunduh.")); }
  }

  return <div className="settings-workspace" lang={language}>
    <LocalizedAttributes><aside className="settings-sidebar" aria-label={t("Navigasi pengaturan")}>
      <h1><T text={"Settings"} /></h1>
      <div className="settings-search"><Search size={15} /><LocalizedAttributes><input aria-label={t("Cari pengaturan")} placeholder="Search" value={search} onChange={event => setSearch(event.target.value)} /></LocalizedAttributes></div>
      <nav><p className="settings-group-label"><T text={"Personal"} /></p>{filtered.map(item => <button key={item.id} type="button" aria-current={section === item.id ? "page" : undefined} onClick={() => select(item.id)}><item.icon /><span><T text={item.label} /></span></button>)}{filtered.length === 0 && <p className="settings-search-empty">{t("Pengaturan tidak ditemukan.")}</p>}<p className="settings-group-label settings-group-secondary"><T text={"Lamaranku"} /></p><Link href="/dashboard"><Folder /><span>{t("Kembali ke dashboard")}</span></Link><Link href="/#cara-kerja"><Shield /><span>{t("Panduan penggunaan")}</span><ArrowUpRight className="settings-nav-arrow" /></Link></nav>
    </aside></LocalizedAttributes>
    <div className={`settings-content${section === "profile" ? " settings-content-profile" : ""}`} key={section}>
      <div className="settings-content-inner">
        {section !== "profile" && <h2><T text={title} /></h2>}
        {section === "general" && <>
          <section className="settings-section"><h3><T text={"Workspace"} /></h3><div className="settings-card">
            <LocalizedAttributes><Row title={t("Sidebar diperlebar")} description={t("Tampilkan nama fitur di samping ikon navigasi dashboard.")}><LocalizedAttributes><Toggle label="Sidebar diperlebar" checked={expanded} onChange={sidebar} /></LocalizedAttributes></Row></LocalizedAttributes>
            <LocalizedAttributes><Row title={t("Konfirmasi sebelum keluar")} description={t("Tanyakan konfirmasi sebelum keluar dari akun Lamaranku.")}><LocalizedAttributes><Toggle label="Konfirmasi sebelum keluar" checked={preferences.confirmLogout} onChange={value => save({ ...preferences, confirmLogout: value })} /></LocalizedAttributes></Row></LocalizedAttributes>
          </div></section>
          <section className="settings-section"><h3><T text={"General"} /></h3><div className="settings-card">
            <LocalizedAttributes><Row title={t("Penyimpanan dokumen")} description={t("Draft dan dokumen dipisahkan berdasarkan akun pada browser yang kamu gunakan.")}><span className="settings-value">{t("Browser ini")}</span></Row></LocalizedAttributes>
            <LocalizedAttributes><Row title={t("Kepadatan tampilan")} description={t("Atur ruang di sekitar konten dashboard.")}><LocalizedAttributes><Dropdown<"comfortable" | "compact"> className="settings-general-dropdown" label={t("Kepadatan tampilan")} value={preferences.compact ? "compact" : "comfortable"} options={[{ value: "comfortable", label: t("Nyaman") }, { value: "compact", label: t("Ringkas") }]} onChange={density => save({ ...preferences, compact: density === "compact" })} /></LocalizedAttributes></Row></LocalizedAttributes>
            <LocalizedAttributes><Row title={t("Animasi")} description={t("Kurangi gerakan transisi pada dashboard.")}><LocalizedAttributes><Dropdown<"system" | "reduced"> className="settings-general-dropdown" label={t("Animasi dashboard")} value={preferences.reduceMotion ? "reduced" : "system"} options={[{ value: "system", label: t("Ikuti sistem") }, { value: "reduced", label: t("Kurangi gerakan") }]} onChange={motion => save({ ...preferences, reduceMotion: motion === "reduced" })} /></LocalizedAttributes></Row></LocalizedAttributes>
            <LocalizedAttributes><Row title={t("Bahasa")} description={t("Bahasa tampilan aplikasi. Isi dokumen tidak berubah.")}><LocalizedAttributes><Dropdown<DashboardPreferences["language"]> className="settings-language-dropdown" label={t("Bahasa")} value={preferences.language ?? "id"} options={[{ value: "system", label: t("Ikuti sistem") }, ...SETTINGS_LANGUAGES]} onChange={language => save({ ...preferences, language })} /></LocalizedAttributes></Row></LocalizedAttributes>
          </div></section>
        </>}
        {section === "profile" && <ProfileWorkspace name={name} email={email} avatarUrl={avatarUrl} username={username} />}
        {section === "appearance" && <AppearanceSettings value={appearance} onChange={saveAppearance} />}
        {section === "storage" && <section className="settings-section"><h3><T text={"Storage"} /></h3><div className="settings-card"><LocalizedAttributes><Row title={t("CV tersimpan")} description={t("Dokumen milik akunmu di browser ini.")}><span className="settings-value">{usage.cvs} {t("dokumen")}</span></Row></LocalizedAttributes><LocalizedAttributes><Row title={t("Penyimpanan lokal")} description={t("Ukuran draft, dokumen, dan preferensi akun di browser ini.")}><span className="settings-value">{(usage.bytes / 1024).toFixed(1)} <T text={"KB"} /></span></Row></LocalizedAttributes><LocalizedAttributes><Row title={t("Sinkronisasi antarperangkat")} description={t("Data lokal belum tersinkron ke perangkat lain.")}><span className="settings-value">{t("Belum tersedia")}</span></Row></LocalizedAttributes></div></section>}
        {section === "billing" && <section className="settings-section"><h3>{t("Paket dan penggunaan")}</h3><div className="settings-card"><LocalizedAttributes><Row title={t("Dokumen CV")} description={t("Jumlah dokumen yang disimpan akunmu di browser ini.")}><span className="settings-value">{usage.cvs} <T text={"CV"} /></span></Row></LocalizedAttributes><LocalizedAttributes><Row title={t("Paket Lamaranku")} description={t("Lihat fitur Basic dan Plus beserta harga yang berlaku.")}><Link className="settings-control" href="/harga">{t("Lihat paket")}<ArrowUpRight size={13} /></Link></Row></LocalizedAttributes></div></section>}
        {section === "data" && <section className="settings-section"><h3><T text={"Data controls"} /></h3><div className="settings-card"><LocalizedAttributes><Row title={t("Ekspor data akun")} description={t("Unduh salinan dokumen, draft, dan preferensi akun yang tersimpan di browser ini. Token login tidak disertakan.")}><button className="settings-control" onClick={exportData}><Download size={13} />{t("Ekspor")}</button></Row></LocalizedAttributes><LocalizedAttributes><Row title={t("Pemisahan data")} description={t("Dokumen akun lain dan simpanan lama tanpa pemilik tidak dimasukkan ke salinan data ini.")}><Shield size={17} /></Row></LocalizedAttributes></div></section>}
        {notice && <p role="status" className="settings-notice"><T text={notice} /></p>}
      </div>
    </div>
  </div>;
}
