"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { DropdownPopover } from "./DropdownPopover";

type Props = { label: string; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode };
export function ActionDropdown({ label, open, onOpenChange, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) onOpenChange(false); };
    const frame = requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus());
    document.addEventListener("pointerdown", dismiss);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("pointerdown", dismiss); };
  }, [open, onOpenChange]);
  function close(restoreFocus = false) { onOpenChange(false); if (restoreFocus) trigger.current?.focus(); }
  return <div className="dash-menu" ref={root} onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === "Tab") { if (open) close(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (!open) { onOpenChange(true); return; }
    const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)') ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const index = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    items[index]?.focus();
  }}>
    <LocalizedAttributes><button type="button" ref={trigger} className="dash-menu-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => onOpenChange(!open)}><T text={label} /></button></LocalizedAttributes>
    <LocalizedAttributes><DropdownPopover open={open} placement="bottom" ref={menu} id={id} role="menu" aria-label={label} className="dash-menu-popover ui-action-menu" onClick={event => {
      if (!(event.target as HTMLElement).closest('a[href],button:not(:disabled)')) return;
      close(!!menu.current?.contains(document.activeElement));
    }}>{children}</DropdownPopover></LocalizedAttributes>
  </div>;
}
