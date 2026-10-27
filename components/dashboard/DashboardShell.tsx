"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, CircleHelp, Crown, Download, House,
  LogOut, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings2, X,
} from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase/client";
import { readAccountValue, writeAccountValue } from "../../lib/account-storage";
import { isPlus, loadSaved } from "../../lib/cv";
import { downloadDashboardSummary, profileHue } from "../../lib/dashboard";
import { useAccountId } from "./AccountContext";
import { dashboardTools, currentDashboardTool } from "./navigation";
import { DashboardDataProvider, useDashboardData } from "./DashboardData";

type Props = { email: string; name?: string; avatarUrl?: string; children: ReactNode };

export function DashboardShell(props: Props) {
  return <DashboardDataProvider><DashboardFrame {...props} /></DashboardDataProvider>;
}

function DashboardFrame({ email, name, avatarUrl, children }: Props) {
  const userId = useAccountId();
  const path = usePathname();
  const router = useRouter();
  const { saved, query, setQuery } = useDashboardData();
  const [expanded, setExpanded] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const menusRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = currentDashboardTool(path);
  const displayName = name || email.split("@")[0] || "Akun Lamaranku";
  const initials = displayName.split(/[ ._-]+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
  const sidebarExpanded = mobile ? open : expanded;

  useEffect(() => {
    setExpanded(readAccountValue("lamaranku_sidebar_expanded", userId) === true);
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
    menusRef.current?.querySelectorAll("details[open]").forEach(menu => menu.removeAttribute("open"));
  }, [path]);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (menusRef.current?.contains(event.target as Node)) return;
      menusRef.current?.querySelectorAll("details[open]").forEach(menu => menu.removeAttribute("open"));
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      menusRef.current?.querySelectorAll("details[open]").forEach(menu => {
        menu.removeAttribute("open");
        menu.querySelector("summary")?.focus();
      });
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

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

  function openMenu(target: HTMLDetailsElement) {
    if (target.open) menusRef.current?.querySelectorAll("details").forEach(menu => {
      if (menu !== target) menu.open = false;
    });
  }

  function closeMenu(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a,button")) event.currentTarget.parentElement?.removeAttribute("open");
  }

  async function logout() {
    if (busy) return;
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
  const style = { "--profile-hue": profileHue(userId ?? email) } as CSSProperties;

  return (
    <div className={`dash${expanded ? " is-expanded" : ""}${open ? " is-nav-open" : ""}`} style={style}>
      <a href="#dashboard-main" className="dash-skip">Langsung ke konten</a>
      <header className="dash-appbar no-print">
        <div className="dash-window-controls">
          <button className="dash-chrome-button dash-history-button" type="button" onClick={() => router.back()} aria-label="Kembali" title="Kembali"><ArrowLeft size={18} /></button>
          <button className="dash-chrome-button dash-history-button" type="button" onClick={() => router.forward()} aria-label="Maju" title="Maju"><ArrowRight size={18} /></button>
          <button ref={menuRef} className="dash-chrome-button" type="button" onClick={toggleSidebar}
            aria-label={toggleLabel} title={toggleLabel} aria-expanded={sidebarExpanded} aria-controls="dashboard-sidebar">
            {sidebarExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
          </button>
        </div>
        <div ref={menusRef} className="dash-menus">
          <Link href="/" className="dash-wordmark" aria-label="Lamaranku beranda">lamaranku.</Link>
          <details className="dash-menu" onToggle={event => openMenu(event.currentTarget)}>
            <summary>File</summary>
            <div className="dash-menu-items" onClick={closeMenu}>
              <Link href="/">Beranda Lamaranku</Link>
              <Link href="/dashboard/cv-builder"><Plus size={15} />CV baru</Link>
              <Link href="/dashboard/portfolio">Buat portofolio</Link>
              <button type="button" onClick={exportSummary}><Download size={15} />Unduh ringkasan CV</button>
            </div>
          </details>
          <details className="dash-menu" onToggle={event => openMenu(event.currentTarget)}>
            <summary>Edit</summary>
            <div className="dash-menu-items" onClick={closeMenu}>
              <Link href="/dashboard/cv-builder">Edit CV</Link>
              <Link href="/dashboard/portfolio">Edit portofolio</Link>
              <button type="button" onClick={() => searchRef.current?.focus()}><Search size={15} />Cari dokumen</button>
            </div>
          </details>
          <details className="dash-menu" onToggle={event => openMenu(event.currentTarget)}>
            <summary>View</summary>
            <div className="dash-menu-items" onClick={closeMenu}>
              <button type="button" onClick={toggleSidebar}>{toggleLabel}</button>
              <button type="button" onClick={() => searchRef.current?.focus()}><Search size={15} />Cari dokumen</button>
            </div>
          </details>
          <Link href="/#cara-kerja" className="dash-help-link">Help</Link>
        </div>
        <form className="dash-search" role="search" onSubmit={event => {
          event.preventDefault(); if (path !== "/dashboard") router.push("/dashboard");
        }}>
          <Search size={16} aria-hidden="true" />
          <input ref={searchRef} type="search" aria-label="Cari CV tersimpan" placeholder="Cari dokumen..." value={query} onChange={event => setQuery(event.target.value)} />
        </form>
        <div className="dash-appbar-actions">
          <button className="dash-chrome-button" type="button" aria-label="Unduh ringkasan CV" title="Unduh ringkasan CV" onClick={exportSummary}><Download size={17} /></button>
          <Link href="/harga" className="dash-plan-link" aria-label={plus ? "Lihat paket Plus" : "Upgrade Plus"}><Crown size={15} /><span>{plus ? "Paket Plus" : "Upgrade Plus"}</span></Link>
          <button className="dash-chrome-button" type="button" onClick={() => void logout()} disabled={busy} aria-label={busy ? "Sedang keluar" : "Keluar dari akun"} title="Keluar dari akun"><LogOut size={17} /></button>
        </div>
      </header>
      {mobile && open && <button className="dash-backdrop" aria-label="Tutup navigasi" onClick={closeMobileSidebar} />}
      <div className="dash-frame">
        <aside ref={sidebarRef} id="dashboard-sidebar" className="dash-sidebar" aria-label="Menu dashboard"
          role={mobile && open ? "dialog" : undefined} aria-modal={mobile && open ? true : undefined}>
          <button type="button" className="dash-rail-close" aria-label="Tutup menu" onClick={closeMobileSidebar}><X size={18} /><span>Tutup menu</span></button>
          <nav className="dash-rail-nav" aria-label="Navigasi dashboard">
            {dashboardTools.map((tool, index) => (
              <Link key={tool.href} href={tool.href} className="dash-rail-link" title={tool.title} aria-label={tool.title}
                aria-current={current.href === tool.href ? "page" : undefined}>
                {index === 0 ? <House size={22} strokeWidth={1.6} /> : <tool.icon size={22} strokeWidth={1.6} />}
                <span className="dash-rail-label">{tool.title}</span>
              </Link>
            ))}
            <Link href="/dashboard/cv-builder" className="dash-rail-link" title="Tambah CV" aria-label="Tambah CV"><Plus size={22} strokeWidth={1.6} /><span className="dash-rail-label">Tambah CV</span></Link>
            <span className="dash-rail-separator" aria-hidden="true" />
            <Link href="/harga" className="dash-rail-link" title="Paket dan fitur" aria-label="Paket dan fitur"><Settings2 size={22} strokeWidth={1.6} /><span className="dash-rail-label">Paket & fitur</span></Link>
            <Link href="/#cara-kerja" className="dash-rail-link" title="Cara kerja" aria-label="Cara kerja"><CircleHelp size={22} strokeWidth={1.6} /><span className="dash-rail-label">Cara kerja</span></Link>
          </nav>
          <div className="dash-rail-profile" title={email}>
            <span className="dash-avatar">
              {avatarUrl && !avatarFailed ? <img src={avatarUrl} width={32} height={32} alt="" onError={() => setAvatarFailed(true)} /> : initials}
            </span>
            <span className="dash-profile-copy"><strong>{displayName}</strong><small>{plus ? "Paket Plus" : "Paket Basic"}</small></span>
          </div>
        </aside>
        <div ref={bodyRef} className="dash-body" aria-hidden={mobile && open ? true : undefined}>
          <main id="dashboard-main" className="dash-main" tabIndex={-1}>
            <div className="dash-context no-print">
              {path === "/dashboard" ? <h1>Ringkasan</h1> : <span>{current.title}</span>}
              <span className="dash-count-badge">{saved === null ? "…" : `${saved.length} CV tersimpan`}</span>
            </div>
            {error && <p role="alert" className="dash-error">{error}</p>}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
