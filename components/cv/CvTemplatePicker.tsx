"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Crown, LayoutTemplate } from "lucide-react";
import { TEMPLATES, type TemplateKind } from "../../data/templates";
import type { CvData } from "../../lib/cv";
import CvSheet from "./CvSheet";
import "./template-picker.css";

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
            Pilih template CV
          </h2>
          <p>Bandingkan modelnya, lalu pilih tampilan yang cocok untukmu.</p>
        </div>
        <div
          className="cv-template-filters"
          role="group"
          aria-label="Jenis template"
        >
          {(
            [
              { id: "all", label: "Semua" },
              { id: "ats", label: "ATS" },
              { id: "kreatif", label: "Kreatif" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div
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
            <button
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
                <span className="cv-template-thumbnail-paper">
                  <CvSheet
                    data={{ ...value, templateId: template.id }}
                    watermark={false}
                    fill
                  />
                </span>
              </span>
              {template.plusOnly && (
                <span className="cv-template-plus">
                  <Crown size={11} aria-hidden="true" />
                  Plus
                </span>
              )}
              {selected && (
                <span className="cv-template-selected" aria-hidden="true">
                  <Check size={12} />
                </span>
              )}
              <span className="cv-template-name">{template.name}</span>
              <span className="cv-template-kind">
                {template.kind === "ats" ? "ATS Friendly" : "Kreatif"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="cv-template-picker-note" role="status">
        {lockedName ? (
          <>
            <Crown size={14} aria-hidden="true" />
            <span>
              Template {lockedName} tersedia di paket Plus.{" "}
              <Link href="/harga">Lihat paket Plus</Link>
            </span>
          </>
        ) : (
          <>
            <Check size={14} aria-hidden="true" />
            <span>
              Mengganti template tetap mempertahankan data CV yang sudah kamu
              isi.
            </span>
          </>
        )}
      </div>
    </section>
  );
}
