"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import "../dashboard/help-modal.css";

export function ConfirmModal({ title, children, confirmLabel, onConfirm, onClose }: {
  title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <LocalizedAttributes><dialog ref={dialog} className="help-modal" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <button type="button" className="help-modal-close" aria-label="Tutup" onClick={onClose}><X size={18} /></button>
    <header><h2 id={titleId}><T text={title} /></h2></header>
    <div className="help-modal-body">{children}</div>
    <div className="help-modal-actions justify-end">
      <button type="button" autoFocus onClick={onClose}><T text="Batal" /></button>
      <button type="button" onClick={onConfirm}><T text={confirmLabel} /></button>
    </div>
  </dialog></LocalizedAttributes>;
}
