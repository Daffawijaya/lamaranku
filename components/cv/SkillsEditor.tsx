"use client";

import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { useId, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import "./skills-editor.css";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  separator?: "\n" | ", ";
  placeholder: string;
};

export function SkillsEditor({ label, value, onChange, separator = "\n", placeholder }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const skills = value.split(separator === "\n" ? /\r?\n/ : /[,\r\n]+/).map(skill => skill.trim()).filter(Boolean);
  const write = (next: string[]) => onChange(next.join(separator));

  function add() {
    const skill = draft.trim();
    if (!skill) return;
    if (skills.some(item => item.toLocaleLowerCase() === skill.toLocaleLowerCase())) {
      setNotice("Skill ini sudah ditambahkan.");
      input.current?.focus();
      return;
    }
    write([...skills, skill]);
    setDraft("");
    setNotice("");
    input.current?.focus();
  }

  return <section className="cv-skills-editor" aria-labelledby={`${id}-heading`}>
    <h3 id={`${id}-heading`}><T text={label} /></h3>
    {skills.length > 0 ? <LocalizedAttributes><ul className="cv-skill-items" aria-label={`Daftar ${label.toLowerCase()}`}>
      {skills.map((skill, index) => <li key={`${skill}-${index}`}>
        <span>{skill}</span>
        <LocalizedAttributes><button type="button" aria-label={`Hapus ${skill} dari ${label.toLowerCase()}`} title={`Hapus ${skill}`}
          onClick={() => { write(skills.filter((_, at) => at !== index)); setNotice(""); input.current?.focus(); }}>
          <X size={14} aria-hidden="true" />
        </button></LocalizedAttributes>
      </li>)}
    </ul></LocalizedAttributes> : <p className="cv-skill-empty"><T text={"Belum ada "} /><T text={label.toLowerCase()} />.</p>}
    <div className="cv-skill-entry-row">
      <label htmlFor={id} className="sr-only"><T text={"Tambah "} /><T text={label.toLowerCase()} /></label>
      <LocalizedAttributes><input ref={input} id={id} value={draft} autoComplete="off" placeholder={placeholder}
        onChange={event => { setDraft(event.target.value); setNotice(""); }}
        onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); add(); } }} /></LocalizedAttributes>
      <LocalizedAttributes><button type="button" className="cv-skill-add" disabled={!draft.trim()} onClick={add} aria-label={`Tambah ${label.toLowerCase()}`}>
        <Plus size={14} aria-hidden="true" /><span><T text={"Tambah"} /></span>
      </button></LocalizedAttributes>
    </div>
    {notice && <p className="cv-skill-notice" role="status"><T text={notice} /></p>}
  </section>;
}
