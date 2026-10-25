"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Download,
  CircleHelp,
  Sparkles,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { supabaseBrowser } from "../../lib/supabase/client";
import { isPlus, loadSaved } from "../../lib/cv";
import { downloadDashboardSummary } from "../../lib/dashboard";
import { dashboardTools, currentDashboardTool } from "./navigation";
export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(false);
  const current = currentDashboardTool(path);
  useEffect(() => {
    setPlus(isPlus());
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", escape);
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
      <aside
        className={"dash-sidebar" + (open ? " is-open" : "")}
        aria-label="Menu dashboard"
      >
        <div className="dash-brand-row">
          <Link href="/" className="dash-brand">
            lamaranku<span>.</span>
          </Link>
          <button
            className="dash-mobile-control"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Navigasi dashboard">
          {dashboardTools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="dash-nav-link"
              aria-current={current.href === t.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <t.icon size={19} strokeWidth={1.8} />
              {t.title}
            </Link>
          ))}
        </nav>
        <div className="dash-support">
          <span>Dukungan</span>
          <Link href="/#cara-kerja" className="dash-nav-link">
            <CircleHelp size={17} />
            Cara kerja
          </Link>
          <Link href="/harga" className="dash-nav-link">
            <Sparkles size={17} />
            Paket & fitur
          </Link>
        </div>
        <div className="dash-sidebar-bottom">
          <div className="dash-account">
            <span className="dash-avatar">
              {email[0]?.toUpperCase() || "L"}
            </span>
            <div>
              <strong>Paket {plus ? "Plus" : "Basic"}</strong>
              <span title={email}>{email}</span>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={busy}
              aria-label={busy ? "Sedang keluar" : "Keluar dari akun"}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="dash-body">
        <header className="dash-header">
          <button
            className="dash-mobile-control"
            onClick={() => setOpen(true)}
            aria-label="Buka navigasi"
            aria-expanded={open}
          >
            <Menu size={21} />
          </button>
          <div className="dash-header-title">
            {path === "/dashboard" ? (
              <h1>Ringkasan</h1>
            ) : (
              <span>{current.title}</span>
            )}
          </div>
          <div className="dash-header-actions">
            {path === "/dashboard" ? (
              <button
                type="button"
                className="dash-download"
                onClick={() => downloadDashboardSummary(loadSaved())}
              >
                <Download size={14} />
                <span>Unduh ringkasan</span>
              </button>
            ) : (
              <Link href="/dashboard/cv-builder" className="dash-header-create">
                <Plus size={16} />
                Buat CV
              </Link>
            )}
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
  );
}
