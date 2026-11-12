"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Perilaku standar dialog layar penuh: latar menjadi inert di sepanjang jalur
 * dari body sampai ke dialog, Escape menutup, fokus terkurung di dalam, body
 * tidak bisa digulir, dan fokus kembali ke elemen pemicu saat ditutup.
 * Fokus awal: elemen dengan `data-autofocus`, kalau tidak ada ambil yang
 * pertama bisa difokus.
 */
export function useModalA11y(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
) {
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  });
  useEffect(() => {
    if (!active) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const touched: Element[] = [];
    let node: Element | null = root;
    while (node && node !== document.body) {
      const parent: Element | null = node.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (sibling !== node && !sibling.hasAttribute("inert")) {
          sibling.setAttribute("inert", "");
          touched.push(sibling);
        }
      }
      node = parent;
    }
    const preferred = root?.querySelector<HTMLElement>("[data-autofocus]");
    const first = root?.querySelector<HTMLElement>(
      "a[href], button:not([disabled]), textarea, input",
    );
    (preferred ?? first)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab" || !root) return;
      const items = root.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled])",
      );
      if (!items.length) return;
      const firstItem = items[0], lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", onKey);
      for (const element of touched) element.removeAttribute("inert");
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}
