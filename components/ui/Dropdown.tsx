"use client";
import { T, LocalizedAttributes, useAppLanguage } from "../i18n/LanguageProvider";
import { useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import { DropdownPopover } from "./DropdownPopover";
import "./dropdown.css";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};
export type DropdownProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[];
  label: string;
  placeholder?: string;
  className?: string;
};

export function Dropdown<T extends string>({ value, onChange, options, label, placeholder = "Pilih opsi", className = "" }: DropdownProps<T>) {
  const { t } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.find(option => option.value === value);
  useLayoutEffect(() => {
    if (!open || !list.current || !trigger.current) return;
    const content = list.current;
    const menu = content.parentElement!;
    const preferredMaxHeight = getComputedStyle(content).maxHeight;
    const reposition = () => {
      const anchor = trigger.current!.getBoundingClientRect();
      const viewport = window.visualViewport;
      let top = viewport?.offsetTop ?? 0;
      let bottom = top + (viewport?.height ?? window.innerHeight);
      // Account for scroll containers that would otherwise clip the menu.
      for (let parent = root.current?.parentElement; parent; parent = parent.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowY)) {
          const rect = parent.getBoundingClientRect();
          top = Math.max(top, rect.top + parent.clientTop);
          bottom = Math.min(bottom, rect.top + parent.clientTop + parent.clientHeight);
        }
      }
      content.style.maxHeight = preferredMaxHeight;
      const desired = menu.getBoundingClientRect().height;
      const below = Math.max(0, bottom - anchor.bottom - 15);
      const above = Math.max(0, anchor.top - top - 15);
      const upward = below < desired && above > below;
      menu.dataset.placement = upward ? "top" : "bottom";
      content.style.maxHeight = `min(${preferredMaxHeight}, ${Math.max(0, (upward ? above : below) - 10)}px)`;
    };
    reposition();
    const resize = new ResizeObserver(reposition);
    resize.observe(trigger.current);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    window.visualViewport?.addEventListener("resize", reposition);
    window.visualViewport?.addEventListener("scroll", reposition);
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.visualViewport?.removeEventListener("resize", reposition);
      window.visualViewport?.removeEventListener("scroll", reposition);
    };
  }, [open, options.length]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      // Native scrollbar events can be retargeted outside the scroll container.
      const panels = [trigger.current, list.current?.parentElement];
      if (panels.some(panel => {
        const rect = panel?.getBoundingClientRect();
        return rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      })) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    list.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  function choose(next: T) {
    onChange(next);
    setOpen(false); trigger.current?.focus();
  }
  return <div className={"ui-dropdown " + className} ref={root} onKeyDown={event => {
    if (event.key === "Tab") setOpen(false);
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }}>
    <LocalizedAttributes><button ref={trigger} type="button" className="ui-dropdown-trigger" aria-label={t(label) + ": " + t(selected?.label ?? placeholder)} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)} onKeyDown={event => { if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); } }}>
      {selected?.icon && <span className="ui-dropdown-icon" aria-hidden="true">{selected.icon}</span>}<span>{selected?.label ?? placeholder}</span><ChevronRight size={13} />
    </button></LocalizedAttributes>
    <DropdownPopover open={open}><LocalizedAttributes><div ref={list} id={id} role="listbox" aria-label={label} className="ui-dropdown-list" onKeyDown={event => {
      const items = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      let next = index;
      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== " ") {
        next = options.findIndex((option, i) => i > index && t(option.label).toLowerCase().startsWith(event.key.toLowerCase()));
        if (next < 0) next = options.findIndex(option => t(option.label).toLowerCase().startsWith(event.key.toLowerCase()));
      } else return;
      event.preventDefault(); items[next]?.focus();
    }}>{options.map(option => <button key={option.value} type="button" role="option" aria-selected={value === option.value} tabIndex={value === option.value ? 0 : -1} onClick={() => choose(option.value)}>{option.icon && <span className="ui-dropdown-icon" aria-hidden="true">{option.icon}</span>}<span><T text={option.label} /></span>{value === option.value && <Check className="ui-dropdown-check" size={14} aria-hidden="true" />}</button>)}</div></LocalizedAttributes></DropdownPopover>
  </div>;
}
