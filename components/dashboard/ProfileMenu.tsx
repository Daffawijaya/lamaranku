"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { DropdownPopover } from "../ui/DropdownPopover";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type CSSProperties } from "react";
import { ChevronRight, LifeBuoy, LogOut, Send, Settings } from "lucide-react";
import "./profile-menu.css";

type Props = {
  name: string;
  email: string;
  plus: boolean;
  avatar: ReactNode;
  busy: boolean;
  onLogout: () => void;
  route: string;
  themeStyle?: CSSProperties;
  customTheme?: boolean;
  darkMode?: boolean;
};

export function ProfileMenu({ name, email, plus, avatar, busy, onLogout, route, themeStyle, customTheme, darkMode }: Props) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [position, setPosition] = useState({ left: 60, bottom: 10 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const previousRoute = useRef(route);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (previousRoute.current !== route) { setOpen(false); setHelpOpen(false); setNotice(""); }
    previousRoute.current = route;
  }, [route]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      const width = menu.current?.getBoundingClientRect().width ?? 228.8;
      if (rect) setPosition({ left: Math.max(8, Math.min(rect.right + 4.8, window.innerWidth - width - 8)), bottom: Math.max(8, window.innerHeight - rect.bottom) });
    };
    place();
    const frame = requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true }));
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const observer = new ResizeObserver(place);
    if (trigger.current) observer.observe(trigger.current);
    document.addEventListener("pointerdown", dismiss);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); document.removeEventListener("pointerdown", dismiss); };
  }, [open]);

  function close(restoreFocus = false) {
    setOpen(false); setHelpOpen(false); setNotice("");
    if (restoreFocus) trigger.current?.focus();
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.key === "Escape") { event.preventDefault(); close(true); return; }
    if (event.key === "Tab") { event.preventDefault(); close(true); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)") ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[index]?.focus();
  }
  async function invite() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setNotice("Link Lamaranku disalin. Bagikan ke temanmu.");
    } catch { setNotice("Salin alamat aplikasi dari browser untuk mengundang teman."); }
  }

  return <>
    <LocalizedAttributes><button ref={trigger} type="button" className="dash-rail-profile dash-profile-trigger" disabled={!ready} aria-busy={!ready} title={email} aria-label="Menu profil" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? "dashboard-profile-menu" : undefined} onClick={() => { setOpen(value => !value); setHelpOpen(false); setNotice(""); }}>
      {avatar}<span className="dash-profile-copy"><strong>{name}</strong><small><T text={plus ? "Paket Plus" : "Paket Basic"} /></small></span>
    </button></LocalizedAttributes>
    <LocalizedAttributes><DropdownPopover open={open} portal placement="top" ref={menu} id="dashboard-profile-menu" className="profile-popover" data-custom-theme={customTheme} data-theme-mode={darkMode ? "dark" : "light"} style={{ ...themeStyle, ...position }} role="menu" aria-label="Menu akun" onKeyDown={navigate}>
      <Link href="/dashboard/pengaturan?section=profile" role="menuitem" className="profile-popover-person" onClick={() => close()}>
        {avatar}<span><strong>{name}</strong><small><T text={plus ? "Plus" : "Basic"} /></small></span>
      </Link>
      <div role="separator" className="profile-popover-divider" />
      <button role="menuitem" type="button" className="profile-popover-item" onClick={() => void invite()}><Send /><span><T text={"Invite a friend"} /></span></button>
      <Link role="menuitem" href="/dashboard/pengaturan" className="profile-popover-item" onClick={() => close()}><Settings /><span><T text={"Settings"} /></span></Link>
      <div role="separator" className="profile-popover-divider" />
      <button role="menuitem" type="button" className="profile-popover-item" aria-expanded={helpOpen} aria-controls="profile-help-links" onClick={() => setHelpOpen(value => !value)}><LifeBuoy /><span><T text={"Help"} /></span><ChevronRight className={helpOpen ? "profile-help-chevron is-open" : "profile-help-chevron"} /></button>
      {helpOpen && <div id="profile-help-links" className="profile-help-links"><Link role="menuitem" href="/#cara-kerja" onClick={() => close()}><T text={"Cara menggunakan Lamaranku"} /></Link><Link role="menuitem" href="/harga" onClick={() => close()}><T text={"Paket dan fitur"} /></Link></div>}
      <button role="menuitem" type="button" className="profile-popover-item" disabled={busy} onClick={() => { close(); onLogout(); }}><LogOut /><span><T text={busy ? "Logging out…" : "Log out"} /></span></button>
      {notice && <p role="status" className="profile-popover-notice"><T text={notice} /></p>}
    </DropdownPopover></LocalizedAttributes>
  </>;
}
