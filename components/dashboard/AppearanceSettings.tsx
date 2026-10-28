"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { appearancePreset, DEFAULT_APPEARANCE, validHex, type Appearance } from "../../lib/appearance";
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
function ModePreview({ mode }: { mode: Appearance["mode"] }) {
  return <span aria-hidden="true" className={`appearance-mini appearance-mini-${mode}`}><span className="appearance-mini-sidebar"><i /><i /><i /></span><span className="appearance-mini-body"><i /><i /><i /><i /><i /></span>{mode === "system" && <span className="appearance-mini-night"><i /><i /><i /></span>}</span>;
}
export function AppearanceSettings({ value, onChange }: Props) {
  const [notice, setNotice] = useState("");
  function custom(patch: Partial<Appearance>) { onChange({ ...value, ...patch, theme: "custom" }); }
  return <section className="settings-section appearance-section">
    <h3>Visual style</h3>
    <div className="settings-card appearance-mode-card"><Field label="Mode"><div className="appearance-modes" role="group" aria-label="Mode tampilan">{(["system", "light", "dark"] as const).map(mode => <button key={mode} type="button" aria-label={mode === "system" ? "Ikuti sistem" : mode === "light" ? "Light mode" : "Dark mode"} aria-pressed={value.mode === mode} onClick={() => onChange({ ...value, mode })}><ModePreview mode={mode} /><span className="appearance-mode-tooltip" aria-hidden="true">{mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}</span></button>)}</div></Field></div>
    <div className="settings-card appearance-palette-card">
      <Field label="Theme"><div className="appearance-theme-select"><span aria-hidden="true" style={{ color: value.accent }}>Aa</span><select aria-label="Theme" value={value.theme} onChange={event => { const theme = event.target.value as Appearance["theme"]; onChange(theme === "custom" ? { ...value, theme } : appearancePreset(theme)); }}><option value="default">Default</option><option value="ocean">Ocean</option><option value="warm">Warm</option><option value="custom">Custom</option></select></div></Field>
      <Field label="Accent"><select className="appearance-accent-select" aria-label="Preset aksen" value={value.accent === "#3B63FB" ? "blue" : value.accent === "#CC7D5E" ? "terracotta" : "custom"} onChange={event => { if (event.target.value !== "custom") custom({ accent: event.target.value === "blue" ? "#3B63FB" : "#CC7D5E" }); }}><option value="custom">Custom</option><option value="blue">Blue</option><option value="terracotta">Terracotta</option></select><ColorControl label="aksen" value={value.accent} onChange={accent => custom({ accent })} /></Field>
      <Field label="Background"><ColorControl label="background" value={value.background} onChange={background => custom({ background })} /></Field>
      <Field label="Foreground"><ColorControl label="foreground" value={value.foreground} onChange={foreground => custom({ foreground })} /></Field>
      <Field label="Sidebar gradient"><details className="appearance-gradient-picker"><summary aria-label="Kustomisasi gradasi sidebar"><span className="appearance-gradient-swatch" style={{ background: `linear-gradient(90deg, ${value.sidebarTop}, ${value.sidebarMint}, ${value.sidebarYellow}, ${value.sidebarBottom})` }} />Custom<ChevronRight size={12} /></summary><div className="appearance-gradient-stops">{([["sidebarTop", "Atas"], ["sidebarMint", "Mint"], ["sidebarYellow", "Kuning"], ["sidebarBottom", "Bawah"]] as const).map(([key, label]) => <div key={key}><span>{label}</span><ColorControl label={`sidebar ${label.toLowerCase()}`} value={value[key]} onChange={hex => custom({ [key]: hex })} /></div>)}</div></details><ColorControl label="gradasi kuning" value={value.sidebarYellow} onChange={sidebarYellow => custom({ sidebarYellow })} /></Field>
      <Field label="Font"><select aria-label="Font dashboard" value={value.font} onChange={event => custom({ font: event.target.value as Appearance["font"] })}><option value="app">Myriad Pro</option><option value="system">System</option><option value="serif">Serif</option></select></Field>
    </div>
    <details className="appearance-advanced"><summary>Advanced <ChevronRight size={13} /></summary><div><p>Kembalikan mode, warna, font, dan seluruh gradasi sidebar ke tampilan awal Lamaranku.</p><button className="settings-control" onClick={() => { onChange({ ...DEFAULT_APPEARANCE }); setNotice("Tema Default dipulihkan."); }}><RotateCcw size={13} />Reset to Default</button></div></details>
    {notice && <p className="settings-notice" role="status">{notice}</p>}
  </section>;
}
