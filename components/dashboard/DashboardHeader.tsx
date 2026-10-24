"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LogOut, Moon, Search, Sun } from "lucide-react";
import { dashboardTools } from "./navigation";
type Props = {
  title: string;
  email: string;
  busy: boolean;
  dark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
};
export function DashboardHeader({
  title,
  email,
  busy,
  dark,
  onToggleTheme,
  onLogout,
}: Props) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!header.current?.contains(e.target as Node)) {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const results = dashboardTools.filter((t) =>
    (t.title + " " + t.description).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <header
      ref={header}
      className="ref-navbar"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setSearchOpen(false);
          setProfileOpen(false);
        }
      }}
    >
      <div aria-hidden="true" className="mnavbar-blur workspace-navbar-blur" />
      <div className="workspace-navbar-inner">
        <h1 className="workspace-navbar-title">{title}</h1>
        <Link href="/dashboard" className="workspace-mobile-brand">
          lamaranku.
        </Link>
        <div className="workspace-search ref-search-wrap">
          <Search
            size={18}
            aria-hidden="true"
            className="workspace-search-icon"
          />
          <input
            type="search"
            className="ref-search"
            aria-label="Cari fitur"
            placeholder="Cari fitur…"
            value={query}
            onFocus={() => {
              setSearchOpen(true);
              setProfileOpen(false);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            aria-expanded={searchOpen}
            aria-controls="workspace-search-results"
          />
          {searchOpen && (
            <div
              id="workspace-search-results"
              className="workspace-search-results ref-card"
            >
              <p className="workspace-menu-caption">Fitur Lamaranku</p>
              {results.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => setSearchOpen(false)}
                  className="workspace-menu-item"
                >
                  <t.IdleIcon className="size-5" />
                  {t.title}
                </Link>
              ))}
              {results.length === 0 && (
                <p className="workspace-menu-caption">
                  Tidak ada fitur yang cocok.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="ref-icon-btn-liquid workspace-theme">
          <button
            type="button"
            className="ref-icon-btn-plain"
            onClick={() => {
              setSearchOpen(false);
              setProfileOpen(false);
              onToggleTheme();
            }}
            aria-label={dark ? "Matikan mode gelap" : "Nyalakan mode gelap"}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="workspace-profile ref-icon-btn-liquid ref-profile-bare">
          <button
            type="button"
            className="ref-icon-btn-plain"
            aria-label="Menu akun"
            aria-expanded={profileOpen}
            aria-controls="workspace-profile-menu"
            onClick={() => {
              setSearchOpen(false);
              setProfileOpen((v) => !v);
            }}
          >
            <span className="workspace-avatar">
              {email[0]?.toUpperCase() ?? "L"}
            </span>
          </button>
          {profileOpen && (
            <div
              id="workspace-profile-menu"
              className="workspace-profile-menu ref-card"
            >
              <div className="workspace-profile-info">
                <strong>Akun Lamaranku</strong>
                <p>{email}</p>
              </div>
              <Link href="/" className="workspace-menu-item">
                <ArrowUpRight size={17} />
                Lihat website
              </Link>
              <button
                type="button"
                className="workspace-menu-item"
                onClick={onToggleTheme}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}Mode{" "}
                {dark ? "terang" : "gelap"}
              </button>
              <button
                type="button"
                className="workspace-menu-item workspace-menu-danger"
                disabled={busy}
                onClick={onLogout}
              >
                <LogOut size={17} />
                {busy ? "Sedang keluar…" : "Keluar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
