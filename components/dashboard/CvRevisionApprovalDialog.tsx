"use client";
import { useState } from "react";
import type { CvRevisionProposal } from "../../lib/cv-revision-approval";
import { ConfirmModal } from "../ui/ConfirmModal";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { DashboardTable } from "./DashboardTable";
import "./cv-clarification.css";

export function CvRevisionApprovalDialog({ proposals, onComplete, onClose }: {
  proposals: CvRevisionProposal[]; onComplete: (approved: CvRevisionProposal[]) => void; onClose: () => void;
}) {
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const selected = proposals.filter(item => choices[item.id] === true);
  const all = proposals.length > 0 && selected.length === proposals.length;
  return <ConfirmModal title="Pilih revisi CV" className="cv-clarification-modal cv-revision-table-modal"
    confirmLabel="Terapkan pilihan" confirmDisabled={selected.length === 0}
    cancelLabel="Tutup" onConfirm={() => onComplete(selected)} onClose={onClose}
    footerStart={<span className="cv-revision-selection-count"><T text="{0} dari {1} dipilih" values={[selected.length, proposals.length]} /></span>}>
    <p className="cv-revision-table-hint"><T text="Centang revisi yang ingin digunakan. Pastikan angka dan tahunnya benar." /></p>
    <DashboardTable className="cv-revision-choice-table" caption={<T text="Pilihan revisi CV" />} header={<tr>
      <th scope="col"><T text="Teks asli" /></th>
      <th scope="col"><T text="Usulan AI" /></th>
      <th scope="col" className="cv-revision-checkbox-column"><label className="cv-revision-select-all"><span><T text="Pilih semua" /></span>
        <LocalizedAttributes><input type="checkbox" checked={all} aria-label="Pilih semua revisi"
          ref={element => { if (element) element.indeterminate = selected.length > 0 && !all; }}
          onChange={event => setChoices(Object.fromEntries(proposals.map(item => [item.id, event.target.checked])))} /></LocalizedAttributes>
      </label></th>
    </tr>}>
      {proposals.map((item, index) => <tr key={item.id} data-selected={choices[item.id] === true ? "true" : undefined}>
        <td><span className="cv-revision-row-number"><T text="Bagian {0}" values={[index + 1]} /></span><div>{item.before}</div></td>
        <td><div>{item.after}</div></td>
        <td className="cv-revision-checkbox-column"><LocalizedAttributes><input type="checkbox" checked={choices[item.id] === true}
          aria-label={`Gunakan revisi bagian ${index + 1}`}
          onChange={event => setChoices({ ...choices, [item.id]: event.target.checked })} /></LocalizedAttributes></td>
      </tr>)}
    </DashboardTable>
  </ConfirmModal>;
}
