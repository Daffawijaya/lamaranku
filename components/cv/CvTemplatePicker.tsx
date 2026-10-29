"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { memo, useState } from "react";
import { Check, Crown, LayoutTemplate } from "lucide-react";
import { TEMPLATES, type TemplateId, type TemplateKind } from "../../data/templates";
import { DEFAULT_CV, type CvData } from "../../lib/cv";
import CvSheet from "./CvSheet";
import "./template-picker.css";
import { FilterTabs } from "../FilterTabs";
import { ProfessionalPreview } from "./ProfessionalPreview";

// Template examples stay static; only the main document previews live edits.
const TemplatePreview = memo(function TemplatePreview({ id }: { id: TemplateId }) {
  return <CvSheet data={{ ...DEFAULT_CV, templateId: id }} watermark={false} fill />;
});

export function CvTemplatePicker({
  value,
  onChange,
  plus,
}: {
  value: CvData;
  onChange: (cv: CvData) => void;
  plus: boolean;
}) {
  const [filter, setFilter] = useState<"all" | TemplateKind>("all");
  const [lockedName, setLockedName] = useState("");
  return (
    <section
      id="cv-template-picker"
      className="cv-template-picker no-print"
      aria-labelledby="cv-template-picker-title"
    >
      <div className="cv-template-picker-heading">
        <div>
          <h2 id="cv-template-picker-title">
            <LayoutTemplate size={17} aria-hidden="true" />
            <T text={"Pilih template CV "} /></h2>
          <p><T text={"Bandingkan modelnya, lalu pilih tampilan yang cocok untukmu."} /></p>
        </div>
        <LocalizedAttributes><FilterTabs<"all" | TemplateKind>
          size="sm"
          label="Jenis template"
          options={[{ value: "all", label: "Semua" }, { value: "ats", label: "ATS" }, { value: "kreatif", label: "Kreatif" }]}
          value={filter}
          onChange={setFilter}
        /></LocalizedAttributes>
      </div>
      <LocalizedAttributes><div
        className="cv-template-options"
        role="group"
        aria-label="Pilihan model CV"
      >
        {TEMPLATES.filter(
          (template) => filter === "all" || template.kind === filter,
        ).map((template) => {
          const selected = value.templateId === template.id;
          const locked = template.plusOnly && !plus;
          return (
            <LocalizedAttributes key={template.id}><button
              type="button"
              key={template.id}
              className="cv-template-option"
              aria-pressed={selected}
              aria-label={`${template.name}, ${template.kind === "ats" ? "ATS" : "kreatif"}${locked ? ", perlu paket Plus" : ""}`}
              title={template.desc}
              onClick={() => {
                if (locked) {
                  setLockedName(template.name);
                  return;
                }
                setLockedName("");
                onChange({ ...value, templateId: template.id });
              }}
            >
              <span className="cv-template-thumbnail" aria-hidden="true">
                {template.id === "professional" ? <ProfessionalPreview /> : <span className="cv-template-thumbnail-paper">
                  <TemplatePreview id={template.id} />
                </span>}
              </span>
              {template.plusOnly && (
                <span className="cv-template-plus">
                  <Crown size={11} aria-hidden="true" />
                  <T text={"Plus "} /></span>
              )}
              {selected && (
                <span className="cv-template-selected" aria-hidden="true">
                  <Check size={12} />
                </span>
              )}
              <span className="cv-template-name">{template.name}</span>
              <span className="cv-template-kind">
                <T text={template.kind === "ats" ? "ATS Friendly" : "Kreatif"} />
              </span>
            </button></LocalizedAttributes>
          );
        })}
      </div></LocalizedAttributes>
      <div className="cv-template-picker-note" role="status">
        {lockedName ? (
          <>
            <Crown size={14} aria-hidden="true" />
            <span>
              <T text={"Template "} />{lockedName} <T text={"tersedia di paket Plus."} />{" "}
              <Link href="/harga"><T text={"Lihat paket Plus"} /></Link>
            </span>
          </>
        ) : (
          <>
            <Check size={14} aria-hidden="true" />
            <span>
              <T text={"Mengganti template tetap mempertahankan data CV yang sudah kamu isi. "} /></span>
          </>
        )}
      </div>
    </section>
  );
}
