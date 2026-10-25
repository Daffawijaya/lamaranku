"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronDown,
  CircleHelp,
  Crown,
  Download,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase/client";
import { isPlus, loadSaved } from "../../lib/cv";
import { downloadDashboardSummary } from "../../lib/dashboard";
import { dashboardTools, currentDashboardTool } from "./navigation";
import { DashboardDataProvider, useDashboardData } from "./DashboardData";

type Props = {
  email: string;
  name?: string;
  avatarUrl?: string;
  children: ReactNode;
};

export function DashboardShell(props: Props) {
  return (
    <DashboardDataProvider>
      <DashboardFrame {...props} />
    </DashboardDataProvider>
  );
}

function DashboardFrame({ email, name, avatarUrl, children }: Props) {
  const path = usePathname();
  const router = useRouter();
  const { saved, query, setQuery } = useDashboardData();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const current = currentDashboardTool(path);
  const displayName = name || email.split("@")[0] || "Akun Lamaranku";
  const initials = displayName
    .split(/[ ._-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    setPlus(isPlus());
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (event.key !== "Tab") return;
      const items = sidebarRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabaseBrowser().auth.signOut();
      if (error) throw error;
      router.replace("/masuk");
      router.refresh();
    } catch {
      setError("Gagal keluar. Silakan coba lagi.");
      setBusy(false);
    }
  }

  return (
    <div className="dash">
      <a href="#dashboard-main" className="dash-skip">
        Langsung ke konten
      </a>
      {open && (
        <button
          className="dash-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="dash-frame">
        <aside
          ref={sidebarRef}
          id="dashboard-sidebar"
          className={"dash-sidebar" + (open ? " is-open" : "")}
          aria-label="Menu dashboard"
        >
          <div className="dash-brand-row">
            <Link
              href="/"
              className="dash-brand"
              aria-label="Lamaranku beranda"
            >
              <span className="dash-brand-mark" aria-hidden="true">
                <i />
                <i />
              </span>
              lamaranku.
            </Link>
            <button
              className="dash-mobile-control"
              type="button"
              aria-label="Tutup menu"
              onClick={() => {
                setOpen(false);
                menuRef.current?.focus();
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="dash-profile">
            <span className="dash-profile-dots" aria-hidden="true" />
            <div className="dash-profile-picture">
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt=""
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
              <span className="dash-profile-status" aria-hidden="true">
                <Activity size={11} />
              </span>
            </div>
            <strong title={email}>{displayName}</strong>
          </div>
          <nav className="dash-nav" aria-label="Navigasi dashboard">
            <Link
              href="/dashboard"
              className="dash-nav-link"
              aria-current={path === "/dashboard" ? "page" : undefined}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>
            <button
              className="dash-nav-link dash-tools-toggle"
              type="button"
              aria-expanded={toolsOpen}
              aria-controls="dashboard-tool-links"
              onClick={() => setToolsOpen((value) => !value)}
            >
              <Folder size={17} />
              Alat lamaran
              <ChevronDown
                size={14}
                className={toolsOpen ? "is-expanded" : ""}
              />
            </button>
            <div
              id="dashboard-tool-links"
              className="dash-tool-links"
              hidden={!toolsOpen}
            >
              {dashboardTools.slice(1).map((tool, index) => (
                <Link
                  href={tool.href}
                  key={tool.href}
                  className="dash-tool-link"
                  aria-current={current.href === tool.href ? "page" : undefined}
                >
                  <span className={`dash-tool-dot dot-${index}`} />
                  {tool.title}
                </Link>
              ))}
            </div>
            <Link href="/#cara-kerja" className="dash-nav-link">
              <CircleHelp size={17} />
              Cara kerja
            </Link>
            <Link href="/harga" className="dash-nav-link">
              <Settings2 size={17} />
              Paket & fitur
            </Link>
          </nav>
          <Link href="/dashboard/cv-builder" className="dash-add-document">
            <strong>Tambah CV</strong>
            <span>Mulai cerita kariermu</span>
            <i>
              <Plus size={21} />
            </i>
          </Link>
        </aside>
        <div className="dash-body">
          <header className="dash-header">
            <button
              ref={menuRef}
              className="dash-mobile-control"
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={open}
              aria-controls="dashboard-sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="dash-header-title">
              {path === "/dashboard" ? (
                <h1>Ringkasan</h1>
              ) : (
                <span>{current.title}</span>
              )}
              <span className="dash-count-badge">
                {saved === null ? "…" : `${saved.length} CV`}
              </span>
            </div>
            <form
              className="dash-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                if (path !== "/dashboard") router.push("/dashboard");
              }}
            >
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                aria-label="Cari CV tersimpan"
                placeholder="Cari dokumen..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
            <div className="dash-header-actions">
              <button
                className="dash-icon-button"
                type="button"
                title="Unduh ringkasan CV"
                aria-label="Unduh ringkasan CV"
                onClick={() => downloadDashboardSummary(loadSaved())}
              >
                <Download size={18} />
              </button>
              <button
                className="dash-icon-button"
                type="button"
                onClick={() => void logout()}
                disabled={busy}
                title="Keluar dari akun"
                aria-label={busy ? "Sedang keluar" : "Keluar dari akun"}
              >
                <LogOut size={19} />
              </button>
              <Link
                href="/harga"
                className="dash-upgrade"
                aria-label={plus ? "Lihat paket Plus" : "Upgrade Plus"}
              >
                <Crown size={17} aria-hidden="true" />
                <span>{plus ? "Paket Plus" : "Upgrade Plus"}</span>
              </Link>
            </div>
          </header>
          <main id="dashboard-main" className="dash-main">
            {error && (
              <p role="alert" className="dash-error">
                {error}
              </p>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
