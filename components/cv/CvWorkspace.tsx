"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Download,
  Eye,
  FilePlus2,
  GraduationCap,
  LayoutTemplate,
  Plus,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import CvForm, { type CvSection } from "./CvForm";
import CvSheet from "./CvSheet";
import { CvTemplatePicker } from "./CvTemplatePicker";
import type { CvData, SavedCv } from "../../lib/cv";
import { templateById } from "../../data/templates";
import { PLUS_PRICE } from "../../data/features";
import { wa } from "../../lib/wa";

const sections = [
  { id: "profile", label: "Data diri", icon: UserRound },
  { id: "experience", label: "Pengalaman", icon: BriefcaseBusiness },
  { id: "education", label: "Pendidikan", icon: GraduationCap },
  { id: "skills", label: "Keahlian", icon: Sparkles },
] as const;

type Props = {
  cv: CvData;
  onChange: (cv: CvData) => void;
  title: string;
  onTitleChange: (title: string) => void;
  plus: boolean;
  saved: SavedCv[];
  editingId: string | null;
  notice: string | null;
  limitReached: boolean;
  onSave: () => void;
  onNew: () => void;
  onOpen: (cv: SavedCv) => void;
  onDelete: (id: string) => void;
};

export function CvWorkspace({
  cv,
  onChange,
  title,
  onTitleChange,
  plus,
  saved,
  editingId,
  notice,
  limitReached,
  onSave,
  onNew,
  onOpen,
  onDelete,
}: Props) {
  const [section, setSection] = useState<CvSection>("profile");
  function navigateTabs(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? sections.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + sections.length) %
            sections.length;
    setSection(sections[target].id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
      [target]?.focus();
  }
  return (
    <div className="cv-studio">
      <div className="cv-studio-toolbar no-print">
        <div>
          <Link href="/dashboard" className="cv-studio-back">
            <ArrowLeft size={14} />
            Ruang kerja
          </Link>
          <h1>{editingId ? "Lanjutkan CV-mu" : "Buat cerita kariermu"}</h1>
          <p>Isi detailnya. Lihat perubahanmu langsung di samping.</p>
        </div>
        <div className="cv-studio-actions">
          <button onClick={onNew} type="button" className="cv-studio-button">
            <Plus size={15} />
            CV baru
          </button>
          <button onClick={onSave} type="button" className="cv-studio-button">
            <Save size={15} />
            {editingId ? "Simpan perubahan" : "Simpan CV"}
          </button>
          <button
            onClick={() => window.print()}
            type="button"
            className="cv-studio-button is-primary"
          >
            <Download size={15} />
            Unduh PDF
          </button>
        </div>
      </div>
      {notice && (
        <p role="status" className="cv-studio-notice no-print">
          <Check size={16} />
          {notice}
        </p>
      )}
      <CvTemplatePicker value={cv} onChange={onChange} plus={plus} />
      <div className="cv-studio-grid">
        <section
          className="cv-studio-settings no-print"
          aria-label="Pengaturan CV"
        >
          <div className="cv-studio-settings-header">
            <LayoutTemplate size={18} />
            <div>
              <strong>Isi CV</strong>
              <span>Lengkapi bagian demi bagian</span>
            </div>
          </div>
          <div className="cv-studio-tabs" role="tablist" aria-label="Bagian CV">
            {sections.map((item, i) => (
              <button
                id={`cv-tab-${item.id}`}
                key={item.id}
                type="button"
                role="tab"
                aria-selected={section === item.id}
                aria-controls="cv-editor-panel"
                tabIndex={section === item.id ? 0 : -1}
                onClick={() => setSection(item.id)}
                onKeyDown={(event) => navigateTabs(event, i)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div
            id="cv-editor-panel"
            role="tabpanel"
            aria-labelledby={`cv-tab-${section}`}
            className="cv-studio-fields"
          >
            <CvForm value={cv} onChange={onChange} section={section} />
          </div>
          <div className="cv-studio-save">
            <label htmlFor="cv-save-title">Nama dokumen</label>
            <input
              id="cv-save-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Nama CV kamu"
            />
            <span>
              {saved.length} CV tersimpan ·{" "}
              {plus ? "Paket Plus" : "Basic: maksimal 2 CV"}
            </span>
            {limitReached && (
              <p>
                Simpanan penuh. Hapus CV lama atau{" "}
                <a
                  href={wa(
                    `Halo Lamaranku, saya ingin upgrade Plus ${PLUS_PRICE}`,
                  )}
                >
                  lihat paket Plus
                </a>
                .
              </p>
            )}
          </div>
        </section>
        <section className="cv-studio-preview" aria-label="Pratinjau CV">
          <div className="cv-studio-preview-header no-print">
            <span>
              <Eye size={16} />
              Pratinjau langsung
            </span>
            <a href="#cv-template-picker">
              {templateById(cv.templateId).name}
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="cv-studio-canvas">
            <div className="cv-studio-paper">
              <CvSheet data={cv} watermark={!plus} id="cv-sheet" />
            </div>
          </div>
          <p className="cv-studio-preview-hint no-print">
            {plus
              ? "Plus aktif, hasil tanpa cap."
              : "Paket Basic, hasil menggunakan cap contoh."}{" "}
            <a href="#cv-template-picker">Ganti template</a>
          </p>
        </section>
      </div>
      <section
        className="cv-studio-library no-print"
        aria-labelledby="cv-library-title"
      >
        <div className="dash-section-heading">
          <h2 id="cv-library-title">CV tersimpan</h2>
          <span>{saved.length} dokumen di browser ini</span>
        </div>
        <div className="dash-panel">
          {saved.length === 0 ? (
            <div className="cv-studio-library-empty">
              <FilePlus2 size={21} />
              <p>
                Belum ada CV tersimpan. Klik Simpan CV untuk menyimpan
                pekerjaanmu.
              </p>
            </div>
          ) : (
            saved.map((item) => (
              <div key={item.id} className="cv-studio-saved-row">
                <div>
                  <strong>{item.judul}</strong>
                  <small>
                    {templateById(item.data.templateId).name} · {item.updatedAt}
                  </small>
                </div>
                <button type="button" onClick={() => onOpen(item)}>
                  Buka
                </button>
                <button type="button" onClick={() => onDelete(item.id)}>
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
