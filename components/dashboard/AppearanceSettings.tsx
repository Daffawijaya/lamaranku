"use client";
import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { ACCENTS, selectedAccent, updateAccent, appearanceColors, appearanceTokens, appearanceCard, effectiveDark, customizeAppearance, updateAppearanceColor, appearancePreset, THEMES, DEFAULT_APPEARANCE, validHex, type Appearance } from "../../lib/appearance";
import { DASHBOARD_FONTS } from "../../lib/dashboard-fonts";
import { Dropdown } from "../ui/Dropdown";
import "./appearance.css";

type Props = { value: Appearance; onChange: (value: Appearance) => void };
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="appearance-row"><span><T text={label} /></span><div className="appearance-controls">{children}</div></div>;
}
function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const valid = validHex(draft);
  function commit() { if (valid) onChange(draft.toUpperCase()); }
  return <div className="appearance-color" data-invalid={!valid || undefined}>
    <label className="appearance-swatch" style={{ background: value }}><span className="sr-only"><T text={"Pilih warna "} /><T text={label} /></span><LocalizedAttributes><input type="color" value={value} onChange={event => onChange(event.target.value.toUpperCase())} aria-label={`Pilih warna ${label}`} /></LocalizedAttributes></label>
    <LocalizedAttributes><input aria-label={`HEX ${label}`} aria-invalid={!valid} title={valid ? `Warna ${label}` : "Gunakan format #RRGGBB"} value={draft} maxLength={7} spellCheck={false} onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); commit(); } }} /></LocalizedAttributes>
  </div>;
}
function ThemeDropdown({ value, onChange, systemDark = false }: Props & { systemDark?: boolean }) {
  const dark = effectiveDark(value, systemDark);
  const options = [...THEMES, { id: "custom" as const, label: "Custom" }].map(theme => {
    const palette = theme.id === "custom" ? value : appearancePreset(theme.id);
    const tokens = appearanceTokens({ ...palette, mode: value.mode }, systemDark);
    return {
      value: theme.id, label: theme.label,
      icon: <span className="appearance-theme-sample" style={{ color: tokens["--appearance-accent"], background: dark ? "#111111" : "#FFFFFF" }}><T text={"Aa"} /></span>,
    };
  });
  return <LocalizedAttributes><Dropdown label="Theme" value={value.theme} options={options} onChange={theme => onChange(theme === "custom" ? { ...value, theme } : { ...appearancePreset(theme), mode: value.mode, font: value.font })} /></LocalizedAttributes>;
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
  const defaultAccent = appearanceTokens({ ...appearancePreset(value.baseTheme ?? (value.theme === "custom" ? "default" : value.theme)), mode: value.mode }, systemDark)["--appearance-accent"];
  function custom(patch: Partial<Appearance>) { onChange(customizeAppearance(value, patch)); }
  return <section className="settings-section appearance-section">
    <h3><T text={"Visual style"} /></h3>
    <div className="settings-card appearance-mode-card"><LocalizedAttributes><Field label="Mode"><LocalizedAttributes><div className="appearance-modes" role="group" aria-label="Mode tampilan">{(["system", "light", "dark"] as const).map(mode => <LocalizedAttributes key={mode}><button key={mode} type="button" aria-label={mode === "system" ? "Ikuti sistem" : mode === "light" ? "Light mode" : "Dark mode"} aria-pressed={value.mode === mode} onClick={() => onChange({ ...value, mode })}><ModePreview mode={mode} /><span className="appearance-mode-tooltip" aria-hidden="true"><T text={mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"} /></span></button></LocalizedAttributes>)}</div></LocalizedAttributes></Field></LocalizedAttributes></div>
    <div className="settings-card appearance-palette-card">
      <LocalizedAttributes><Field label="Theme"><ThemeDropdown value={value} onChange={onChange} systemDark={systemDark} /></Field></LocalizedAttributes>
      <LocalizedAttributes><Field label="Accent"><LocalizedAttributes><Dropdown className="appearance-accent-dropdown" label="Accent" value={selectedAccent(value)} options={[
        { value: "default", label: "Default", icon: <span className="appearance-accent-dot" style={{ background: defaultAccent }} /> },
        ...ACCENTS.map(option => ({ value: option.id, label: option.label, icon: <span className="appearance-accent-dot" style={{ background: option.color }} /> })),
        { value: "custom", label: "Custom" },
      ]} onChange={choice => onChange(updateAccent(value, choice))} /></LocalizedAttributes>{selectedAccent(value) === "custom" && <LocalizedAttributes><ColorControl label="aksen" value={value.accent} onChange={accent => custom({ accent, accentChoice: "custom" })} /></LocalizedAttributes>}</Field></LocalizedAttributes>
      <LocalizedAttributes><Field label="Background"><LocalizedAttributes><ColorControl label="background" value={colors.background} onChange={background => onChange(updateAppearanceColor(value, "background", background, systemDark))} /></LocalizedAttributes></Field></LocalizedAttributes>
      <LocalizedAttributes><Field label="Foreground"><LocalizedAttributes><ColorControl label="foreground" value={colors.foreground} onChange={foreground => onChange(updateAppearanceColor(value, "foreground", foreground, systemDark))} /></LocalizedAttributes></Field></LocalizedAttributes>
      <LocalizedAttributes><Field label="Card & dropdown"><LocalizedAttributes><ColorControl label="card" value={appearanceCard(value, effectiveDark(value, systemDark))} onChange={card => onChange(updateAppearanceColor(value, "card", card, systemDark))} /></LocalizedAttributes></Field></LocalizedAttributes>
      <LocalizedAttributes><Field label="Font"><LocalizedAttributes><Dropdown<Appearance["font"]> className="appearance-font-dropdown" label="Font dashboard" value={value.font} options={DASHBOARD_FONTS} onChange={font => custom({ font })} /></LocalizedAttributes></Field></LocalizedAttributes>
    </div>
    <p className="appearance-font-note"><T text={"Font perangkat memakai font pengganti jika belum terpasang di perangkatmu."} /></p>
    <details className="appearance-advanced"><summary><T text={"Advanced "} /><ChevronRight size={13} /></summary><div><p><T text={"Kembalikan mode, warna, dan font ke tampilan awal Lamaranku."} /></p><button className="settings-control" onClick={() => { onChange({ ...DEFAULT_APPEARANCE }); setNotice("Tema Default dipulihkan."); }}><RotateCcw size={13} /><T text={"Reset to Default"} /></button></div></details>
    {notice && <p className="settings-notice" role="status"><T text={notice} /></p>}
  </section>;
}
