"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { ACCENTS, selectedAccent, updateAccent, appearanceColors, effectiveDark, customizeAppearance, updateAppearanceColor, appearancePreset, THEMES, DEFAULT_APPEARANCE, validHex, type Appearance } from "../../lib/appearance";
import { DASHBOARD_FONTS } from "../../lib/dashboard-fonts";
import { Dropdown } from "../ui/Dropdown";
import "./appearance.css";

type Props = { value: Appearance; onChange: (value: Appearance) => void };
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="appearance-row"><span>{label}</span><div className="appearance-controls">{children}</div></div>;
}
function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = validHex(draft);
  function commit() { if (valid) onChange(draft.toUpperCase()); }
  return <div className="appearance-color" data-invalid={!valid || undefined}>
    <label className="appearance-swatch" style={{ background: value }}><span className="sr-only">Pilih warna {label}</span><input type="color" value={value} onChange={event => onChange(event.target.value.toUpperCase())} aria-label={`Pilih warna ${label}`} /></label>
    <input aria-label={`HEX ${label}`} aria-invalid={!valid} title={valid ? `Warna ${label}` : "Gunakan format #RRGGBB"} value={draft} maxLength={7} spellCheck={false} onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit(); } }} />
  </div>;
}
function ThemeDropdown({ value, onChange }: Props) {
  const options = [...THEMES, { id: "custom" as const, label: "Custom" }].map(theme => {
    const palette = theme.id === "custom" ? value : appearancePreset(theme.id);
    return {
      value: theme.id, label: theme.label,
      icon: <span className="appearance-theme-sample" style={{ color: palette.accent, background: palette.background }}>Aa</span>,
    };
  });
  return <Dropdown label="Theme" value={value.theme} options={options} onChange={theme => onChange(theme === "custom" ? { ...value, theme } : { ...appearancePreset(theme), mode: value.mode, font: value.font })} />;
}
function ModePreview({ mode }: { mode: Appearance["mode"] }) {
  return <span aria-hidden="true" className={`appearance-mini appearance-mini-${mode}`}><span className="appearance-mini-sidebar"><i /><i /><i /></span><span className="appearance-mini-body"><i /><i /><i /><i /><i /></span>{mode === "system" && <span className="appearance-mini-night"><i /><i /><i /></span>}</span>;
}
export function AppearanceSettings({ value, onChange }: Props) {
  const [notice, setNotice] = useState("");
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const colors = appearanceColors(value, effectiveDark(value, systemDark));
  function custom(patch: Partial<Appearance>) { onChange(customizeAppearance(value, patch)); }
  return <section className="settings-section appearance-section">
    <h3>Visual style</h3>
    <div className="settings-card appearance-mode-card"><Field label="Mode"><div className="appearance-modes" role="group" aria-label="Mode tampilan">{(["system", "light", "dark"] as const).map(mode => <button key={mode} type="button" aria-label={mode === "system" ? "Ikuti sistem" : mode === "light" ? "Light mode" : "Dark mode"} aria-pressed={value.mode === mode} onClick={() => onChange({ ...value, mode })}><ModePreview mode={mode} /><span className="appearance-mode-tooltip" aria-hidden="true">{mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}</span></button>)}</div></Field></div>
    <div className="settings-card appearance-palette-card">
      <Field label="Theme"><ThemeDropdown value={value} onChange={onChange} /></Field>
      <Field label="Accent"><Dropdown className="appearance-accent-dropdown" label="Accent" value={selectedAccent(value)} options={[
        { value: "default", label: "Default", icon: <span className="appearance-accent-dot" style={{ background: appearancePreset(value.baseTheme ?? (value.theme === "custom" ? "default" : value.theme)).accent }} /> },
        ...ACCENTS.map(option => ({ value: option.id, label: option.label, icon: <span className="appearance-accent-dot" style={{ background: option.color }} /> })),
        { value: "custom", label: "Custom" },
      ]} onChange={choice => onChange(updateAccent(value, choice))} />{selectedAccent(value) === "custom" && <ColorControl label="aksen" value={value.accent} onChange={accent => custom({ accent, accentChoice: "custom" })} />}</Field>
      <Field label="Background"><ColorControl label="background" value={colors.background} onChange={background => onChange(updateAppearanceColor(value, "background", background, systemDark))} /></Field>
      <Field label="Foreground"><ColorControl label="foreground" value={colors.foreground} onChange={foreground => onChange(updateAppearanceColor(value, "foreground", foreground, systemDark))} /></Field>
      <Field label="Font"><Dropdown<Appearance["font"]> className="appearance-font-dropdown" label="Font dashboard" value={value.font} options={DASHBOARD_FONTS} onChange={font => custom({ font })} /></Field>
    </div>
    <p className="appearance-font-note">Font perangkat memakai font pengganti jika belum terpasang di perangkatmu.</p>
    <details className="appearance-advanced"><summary>Advanced <ChevronRight size={13} /></summary><div><p>Kembalikan mode, warna, dan font ke tampilan awal Lamaranku.</p><button className="settings-control" onClick={() => { onChange({ ...DEFAULT_APPEARANCE }); setNotice("Tema Default dipulihkan."); }}><RotateCcw size={13} />Reset to Default</button></div></details>
    {notice && <p className="settings-notice" role="status">{notice}</p>}
  </section>;
}
