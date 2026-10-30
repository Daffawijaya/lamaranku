"use client";

import { T, LocalizedAttributes, translateMessage } from "../i18n/LanguageProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, CircleHelp, Crown, Download, House,
  LogOut, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings2, X,
} from "lucide-react";
import { APPEARANCE_KEY, DEFAULT_APPEARANCE, readAppearance, appearanceTokens } from "../../lib/appearance";
import type { Appearance } from "../../lib/appearance";
import { writeAppearanceCookie } from "../../lib/appearance-cookie";
import { DEFAULT_PREFERENCES, readDashboardPreferences } from "../../lib/dashboard-preferences";
import { ActionDropdown } from "../ui/ActionDropdown";
import { BrandWordmark } from "../BrandWordmark";
import { ProfileMenu } from "./ProfileMenu";
import { supabaseBrowser } from "../../lib/supabase/client";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import { isPlus, loadSaved } from "../../lib/cv";
import { downloadDashboardSummary, profileHue } from "../../lib/dashboard";
import { useAccountId } from "./AccountContext";
import { dashboardTools, currentDashboardTool } from "./navigation";
import { DashboardDataProvider, useDashboardData } from "./DashboardData";

type Props = { email: string; name?: string; avatarUrl?: string; children: ReactNode; initialAppearance?: Appearance; initialSystemDark?: boolean };

export function DashboardShell(props: Props) {
  return <DashboardDataProvider><DashboardFrame {...props} /></DashboardDataProvider>;
}

function DashboardFrame({ email, name, avatarUrl, children, initialAppearance, initialSystemDark }: Props) {
  const userId = useAccountId();
  const path = usePathname();
  const router = useRouter();
  const { saved, query, setQuery } = useDashboardData();
  const [appearance, setAppearance] = useState(initialAppearance ?? DEFAULT_APPEARANCE);
  const [systemDark, setSystemDark] = useState(initialSystemDark ?? false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const settingsRoute = path === "/dashboard/pengaturan";
  const profileRoute = path === "/dashboard/profil";
  const [expanded, setExpanded] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), [avatarUrl]);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = currentDashboardTool(path);
  const displayName = name || email.split("@")[0] || "Akun Lamaranku";
  const initials = displayName.split(/[ ._-]+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const sidebarExpanded = mobile ? open : expanded;

  useEffect(() => {
    const sync = () => {
      setExpanded(readAccountValue("lamaranku_sidebar_expanded", userId) === true);
      setPreferences(readDashboardPreferences(userId));
      const next = readAppearance(userId);
      setAppearance(next);
      writeAppearanceCookie(next, userId, window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    sync(); window.addEventListener("lamaranku:preferences", sync); window.addEventListener("lamaranku:appearance", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("lamaranku:preferences", sync); window.removeEventListener("lamaranku:appearance", sync); window.removeEventListener("storage", sync); };
  }, [userId]);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 760px)");
    const sync = () => {
      setMobile(viewport.matches);
      if (!viewport.matches) setOpen(false);
    };
    sync();
    viewport.addEventListener("change", sync);
    return () => viewport.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setPlus(isPlus());
    setOpen(false);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    setActiveMenu(null);
  }, [path]);

  useEffect(() => {
    if (!mobile || !open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (event.key !== "Tab") return;
      const items = sidebarRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobile, open]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      setSystemDark(media.matches);
      writeAppearanceCookie(readAppearance(userId), userId, media.matches);
    };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [userId]);

  function toggleSidebar() {
    if (mobile) { setOpen(value => !value); return; }
    const next = !expanded;
    setExpanded(next);
    try { writeAccountValue("lamaranku_sidebar_expanded", next, userId); }
    catch { /* Navigation still works when browser preferences cannot be saved. */ }
  }

  function closeMobileSidebar() {
    setOpen(false);
    menuRef.current?.focus();
  }

  async function logout() {
    if (busy) return;
    if (preferences.confirmLogout && !window.confirm(translateMessage("Keluar dari akun Lamaranku?"))) return;
    setBusy(true); setError("");
    try {
      const { error } = await supabaseBrowser().auth.signOut();
      if (error) throw error;
      router.replace("/masuk"); router.refresh();
    } catch {
      setError("Gagal keluar. Silakan coba lagi."); setBusy(false);
    }
  }

  const exportSummary = () => downloadDashboardSummary(loadSaved(userId));
  const toggleLabel = sidebarExpanded ? "Ciutkan sidebar" : "Perlebar sidebar";
  const darkMode = appearance.mode === "dark" || (appearance.mode === "system" && systemDark);
  const customized = darkMode || appearance.theme !== "default" || appearance.accent !== DEFAULT_APPEARANCE.accent || appearance.background !== DEFAULT_APPEARANCE.background || appearance.foreground !== DEFAULT_APPEARANCE.foreground;
  const style = { "--profile-hue": profileHue(userId ?? email), ...appearanceTokens(appearance, systemDark) } as CSSProperties;
  useEffect(() => {
    document.documentElement.style.setProperty("--app-loading-accent", appearanceTokens(appearance, systemDark)["--appearance-accent"]);
    return () => { document.documentElement.style.removeProperty("--app-loading-accent"); };
  }, [appearance, systemDark]);
  function setColorMode(mode: "light" | "dark") {
    const next = { ...appearance, mode };
    try {
      writeAccountValue(APPEARANCE_KEY, next, userId);
      setAppearance(next);
      window.dispatchEvent(new Event("lamaranku:appearance"));
    } catch { setError("Tema belum tersimpan. Penyimpanan browser diblokir atau penuh."); }
  }

  return (
    <div data-theme-mode={darkMode ? "dark" : "light"} data-appearance-custom={customized} data-font-custom={appearance.font !== "app"} data-density={preferences.compact ? "compact" : "comfortable"} data-reduce-motion={preferences.reduceMotion} className={`dash${settingsRoute ? " is-settings" : ""}${profileRoute ? " is-profile" : ""}${expanded ? " is-expanded" : ""}${open ? " is-nav-open" : ""}`} style={style}>
      <a href="#dashboard-main" className="dash-skip"><T text={"Langsung ke konten"} /></a>
      <header className="dash-appbar no-print">
        <div className="dash-window-controls">
          <LocalizedAttributes><button className="dash-chrome-button dash-history-button" type="button" onClick={() => router.back()} aria-label="Kembali" title="Kembali"><ArrowLeft size={18} /></button></LocalizedAttributes>
          <LocalizedAttributes><button className="dash-chrome-button dash-history-button" type="button" onClick={() => router.forward()} aria-label="Maju" title="Maju"><ArrowRight size={18} /></button></LocalizedAttributes>
          <LocalizedAttributes><button ref={menuRef} className="dash-chrome-button" type="button" onClick={toggleSidebar}
            aria-label={toggleLabel} title={toggleLabel} aria-expanded={sidebarExpanded} aria-controls="dashboard-sidebar">
            {sidebarExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
          </button></LocalizedAttributes>
        </div>
        <div className="dash-menus">
          <LocalizedAttributes><Link href="/" className="dash-wordmark" aria-label="Lamaranku beranda"><BrandWordmark /></Link></LocalizedAttributes>
          <ActionDropdown label="File" open={activeMenu === "File"} onOpenChange={value => setActiveMenu(value ? "File" : null)}>
              <Link role="menuitem" href="/"><T text={"Beranda Lamaranku"} /></Link>
              <Link role="menuitem" href="/dashboard/cv-builder" scroll={false}><T text={"CV baru"} /></Link>
              <Link role="menuitem" href="/dashboard/portfolio" scroll={false}><T text={"Buat portofolio"} /></Link>
              <button role="menuitem" type="button" onClick={exportSummary}><T text={"Unduh ringkasan CV"} /></button>
            </ActionDropdown>
          <ActionDropdown label="Edit" open={activeMenu === "Edit"} onOpenChange={value => setActiveMenu(value ? "Edit" : null)}>
              <Link role="menuitem" href="/dashboard/cv-builder" scroll={false}><T text={"Edit CV"} /></Link>
              <Link role="menuitem" href="/dashboard/portfolio" scroll={false}><T text={"Edit portofolio"} /></Link>
              <button role="menuitem" type="button" onClick={() => searchRef.current?.focus()}><T text={"Cari dokumen"} /></button>
            </ActionDropdown>
          <ActionDropdown label="View" open={activeMenu === "View"} onOpenChange={value => setActiveMenu(value ? "View" : null)}>
              <button role="menuitem" type="button" onClick={toggleSidebar}><T text={toggleLabel} /></button>
              <button role="menuitem" type="button" onClick={() => searchRef.current?.focus()}><T text={"Cari dokumen"} /></button>
              <LocalizedAttributes><button role="menuitem" type="button" aria-label={darkMode ? "Light mode" : "Dark mode"} onClick={() => setColorMode(darkMode ? "light" : "dark")}><T text={darkMode ? "Light mode" : "Dark mode"} /></button></LocalizedAttributes>
            </ActionDropdown>
          <ActionDropdown label="Help" open={activeMenu === "Help"} onOpenChange={value => setActiveMenu(value ? "Help" : null)}><Link role="menuitem" href="/#cara-kerja"><T text="Cara kerja" /></Link><Link role="menuitem" href="/harga"><T text="Paket dan fitur" /></Link></ActionDropdown>
        </div>
        <form className="dash-search" role="search" onSubmit={event => {
          event.preventDefault(); if (path !== "/dashboard") router.push("/dashboard", { scroll: false });
        }}>
          <Search size={16} aria-hidden="true" />
          <LocalizedAttributes><input ref={searchRef} type="search" aria-label="Cari CV tersimpan" placeholder="Cari dokumen..." value={query} onChange={event => setQuery(event.target.value)} /></LocalizedAttributes>
        </form>
        <div className="dash-appbar-actions">
          <LocalizedAttributes><button className="dash-chrome-button" type="button" aria-label="Unduh ringkasan CV" title="Unduh ringkasan CV" onClick={exportSummary}><Download size={17} /></button></LocalizedAttributes>
          <LocalizedAttributes><Link href="/harga" className="dash-plan-link" aria-label={plus ? "Lihat paket Plus" : "Upgrade Plus"}><Crown size={15} /><span><T text={plus ? "Paket Plus" : "Upgrade Plus"} /></span></Link></LocalizedAttributes>
          <LocalizedAttributes><button className="dash-chrome-button" type="button" onClick={() => void logout()} disabled={busy} aria-label={busy ? "Sedang keluar" : "Keluar dari akun"} title="Keluar dari akun"><LogOut size={17} /></button></LocalizedAttributes>
        </div>
      </header>
      {mobile && open && <LocalizedAttributes><button className="dash-backdrop" aria-label="Tutup navigasi" onClick={closeMobileSidebar} /></LocalizedAttributes>}
      <div className="dash-frame">
        <LocalizedAttributes><aside ref={sidebarRef} id="dashboard-sidebar" className="dash-sidebar" aria-label="Menu dashboard"
          role={mobile && open ? "dialog" : undefined} aria-modal={mobile && open ? true : undefined}>
          <LocalizedAttributes><button type="button" className="dash-rail-close" aria-label="Tutup menu" onClick={closeMobileSidebar}><X size={18} /><span><T text={"Tutup menu"} /></span></button></LocalizedAttributes>
          <LocalizedAttributes><nav className="dash-rail-nav" aria-label="Navigasi dashboard">
            {dashboardTools.map((tool, index) => (
              <LocalizedAttributes key={tool.href}><Link key={tool.href} href={tool.href} scroll={false} className="dash-rail-link" title={tool.title} aria-label={tool.title}
                aria-current={current.href === tool.href ? "page" : undefined}>
                {current.href === tool.href
                  ? <tool.activeIcon size={22} aria-hidden="true" />
                  : index === 0 ? <House size={22} strokeWidth={1.6} /> : <tool.icon size={22} strokeWidth={1.6} />}
                <span className="dash-rail-label"><T text={tool.title} /></span>
              </Link></LocalizedAttributes>
            ))}
            <LocalizedAttributes><Link href="/dashboard/cv-builder" scroll={false} className="dash-rail-link" title="Tambah CV" aria-label="Tambah CV"><Plus size={22} strokeWidth={1.6} /><span className="dash-rail-label"><T text={"Tambah CV"} /></span></Link></LocalizedAttributes>
            <span className="dash-rail-separator" aria-hidden="true" />
            <LocalizedAttributes><Link href="/harga" className="dash-rail-link" title="Paket dan fitur" aria-label="Paket dan fitur"><Settings2 size={22} strokeWidth={1.6} /><span className="dash-rail-label"><T text={"Paket & fitur"} /></span></Link></LocalizedAttributes>
            <LocalizedAttributes><Link href="/#cara-kerja" className="dash-rail-link" title="Cara kerja" aria-label="Cara kerja"><CircleHelp size={22} strokeWidth={1.6} /><span className="dash-rail-label"><T text={"Cara kerja"} /></span></Link></LocalizedAttributes>
          </nav></LocalizedAttributes>
          <ProfileMenu themeStyle={style} customTheme={customized} darkMode={darkMode} name={displayName} email={email} plus={plus} busy={busy} route={path} onLogout={() => void logout()} avatar={
            <span className="dash-avatar">
              {avatarUrl && !avatarFailed ? <img src={avatarUrl} width={32} height={32} alt="" onError={() => setAvatarFailed(true)} /> : initials}
            </span>
          } />
        </aside></LocalizedAttributes>
        <div ref={bodyRef} className="dash-body" aria-hidden={mobile && open ? true : undefined}>
          {!settingsRoute && !profileRoute && <LocalizedAttributes><header className="dash-context no-print" aria-label="Judul halaman">
            <div className="dash-context-title">
              <current.icon size={16} strokeWidth={1.6} aria-hidden="true" />
              {path === "/dashboard" ? <h1><T text={current.title} /></h1> : <span><T text={current.title} /></span>}
            </div>
            <div className="dash-context-actions">
              <span className="dash-count-badge">{saved === null ? "…" : `${saved.length} CV tersimpan`}</span>
              <div id="dashboard-page-actions" className="dash-header-actions" />
            </div>
          </header></LocalizedAttributes>}
          <main id="dashboard-main" className="dash-main" data-dashboard-ui={!settingsRoute ? "true" : undefined} tabIndex={-1}>
            {path !== "/dashboard" && !settingsRoute && !profileRoute && <h1 className="dash-page-title no-print"><T text={current.pageTitle} /></h1>}
            {error && <p role="alert" className="dash-error"><T text={error} /></p>}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
