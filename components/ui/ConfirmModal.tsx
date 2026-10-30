"use client";

import { useLayoutEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { mountModal } from "../../lib/modal-motion";
import "../dashboard/help-modal.css";

export function ConfirmModal({ title, children, confirmLabel, onConfirm, onClose, cancelLabel = "Batal", onCancelAction, className = "", footerStart, confirmDisabled = false, pending = false }: {
  title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void;
  cancelLabel?: string; onCancelAction?: () => void;
  className?: string; footerStart?: ReactNode;
  confirmDisabled?: boolean;
  pending?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    if (dialog.current) return mountModal(dialog.current);
  }, []);
  return <LocalizedAttributes><dialog ref={dialog} className={`help-modal ${className}`} aria-labelledby={titleId} aria-busy={pending || undefined} tabIndex={-1}
    onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}
    onClick={event => {
      if (pending || event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    {!pending && <button type="button" className="help-modal-close" aria-label="Tutup" onClick={onClose}><X size={18} /></button>}
    <header><h2 id={titleId}><T text={title} /></h2></header>
    <div className="help-modal-body">{children}</div>
    {!pending && <div className="help-modal-actions justify-end">
      {footerStart}
      <button type="button" className="help-modal-button" autoFocus={!onCancelAction} onClick={onCancelAction ?? onClose}><T text={cancelLabel} /></button>
      <button type="button" className="help-modal-button" disabled={confirmDisabled} onClick={onConfirm}><T text={confirmLabel} /></button>
    </div>}
  </dialog></LocalizedAttributes>;
}
