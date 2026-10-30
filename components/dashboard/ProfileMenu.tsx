"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { DropdownPopover } from "../ui/DropdownPopover";
import { HelpModal, HELP_TOPICS, type HelpTopic } from "./HelpModal";
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
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [position, setPosition] = useState({ left: 60, bottom: 10 });
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const helpMenu = useRef<HTMLDivElement>(null);
  const helpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusHelp = useRef(false);
  const [helpPosition, setHelpPosition] = useState({ left: 0, top: 0 });
  function cancelHelpTimer() {
    if (helpTimer.current) clearTimeout(helpTimer.current);
    helpTimer.current = null;
  }
  function scheduleHelp(value: boolean) {
    cancelHelpTimer();
    helpTimer.current = setTimeout(() => { setHelpOpen(value); }, value ? 300 : 200);
  }
  useEffect(() => () => cancelHelpTimer(), []);
  useEffect(() => { if (!open) { cancelHelpTimer(); setHelpOpen(false); } }, [open]);
  const previousRoute = useRef(route);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (!helpOpen) return;
    const frame = requestAnimationFrame(() => {
      if (focusHelp.current) helpMenu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
      focusHelp.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [helpOpen]);
  useLayoutEffect(() => {
    if (!helpOpen) return;
    const place = () => {
      const rect = helpTrigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = helpMenu.current?.offsetWidth ?? 220;
      const height = helpMenu.current?.offsetHeight ?? 160;
      const edge = menu.current?.getBoundingClientRect() ?? rect;
      const left = edge.right + 5 + width <= window.innerWidth - 8 ? edge.right + 5 : Math.max(8, edge.left - width - 5);
      setHelpPosition({ left, top: Math.max(8, Math.min(rect.top - 4, window.innerHeight - height - 8)) });
    };
    place();
    const frame = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [helpOpen, position]);

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
      if (!menu.current?.contains(target) && !trigger.current?.contains(target) && !helpMenu.current?.contains(target)) close();
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const observer = new ResizeObserver(place);
    if (trigger.current) observer.observe(trigger.current);
    document.addEventListener("pointerdown", dismiss);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); document.removeEventListener("pointerdown", dismiss); };
  }, [open]);

  function close(restoreFocus = false) {
    cancelHelpTimer();
    setOpen(false); setHelpOpen(false); setNotice("");
    if (restoreFocus) trigger.current?.focus();
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (event.key === "Escape") { event.preventDefault(); close(true); return; }
    if (event.key === "Tab") { event.preventDefault(); close(true); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const surface = helpMenu.current?.contains(event.target as Node) ? helpMenu.current : menu.current;
    const items = Array.from(surface?.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)") ?? []);
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
      <button ref={helpTrigger} role="menuitem" type="button" className="profile-popover-item" aria-haspopup="menu" aria-expanded={helpOpen} aria-controls={helpOpen ? "profile-help-links" : undefined} onPointerEnter={event => { if (event.pointerType !== "touch") scheduleHelp(true); }} onPointerLeave={() => scheduleHelp(false)} onClick={() => { cancelHelpTimer(); focusHelp.current = true; setHelpOpen(value => !value); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); event.stopPropagation(); cancelHelpTimer(); focusHelp.current = true; setHelpOpen(true); helpMenu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); } }}><LifeBuoy /><span><T text={"Help"} /></span><ChevronRight className="profile-help-chevron" /></button>
      {helpOpen && <DropdownPopover open={helpOpen} portal ref={helpMenu} id="profile-help-links" role="menu" aria-label="Bantuan" className="profile-popover profile-help-links" data-custom-theme={customTheme} data-theme-mode={darkMode ? "dark" : "light"} style={{ ...themeStyle, ...helpPosition }} onPointerEnter={cancelHelpTimer} onPointerLeave={() => scheduleHelp(false)} onKeyDown={event => {
        if (event.key === "Escape" || event.key === "ArrowLeft") {
          event.preventDefault(); event.stopPropagation(); cancelHelpTimer(); setHelpOpen(false); helpTrigger.current?.focus();
        }
      }}>
        {(Object.keys(HELP_TOPICS) as HelpTopic[]).map(topic => <button key={topic} type="button" role="menuitem" className="profile-popover-item" onClick={() => { close(); setHelpTopic(topic); }}><T text={HELP_TOPICS[topic]} /></button>)}
      </DropdownPopover>}
      <button role="menuitem" type="button" className="profile-popover-item" disabled={busy} onClick={() => { close(); onLogout(); }}><LogOut /><span><T text={busy ? "Logging out…" : "Log out"} /></span></button>
      {notice && <p role="status" className="profile-popover-notice"><T text={notice} /></p>}
    </DropdownPopover></LocalizedAttributes>
    {helpTopic && <HelpModal key={helpTopic} topic={helpTopic} route={route} themeStyle={themeStyle} darkMode={darkMode} onClose={() => { setHelpTopic(null); trigger.current?.focus(); }} />}
  </>;
}
