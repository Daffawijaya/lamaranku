import { readAccountValue } from "./account-storage";

export type Appearance = {
  mode: "system" | "light" | "dark";
  theme: "default" | "ocean" | "warm" | "custom";
  accent: string; background: string; foreground: string;
  sidebarTop: string; sidebarMint: string; sidebarYellow: string; sidebarBottom: string;
  font: "app" | "system" | "serif";
};
export const APPEARANCE_KEY = "lamaranku_appearance";
export const DEFAULT_APPEARANCE: Appearance = {
  mode: "light", theme: "default", accent: "#3B63FB", background: "#FFFFFF", foreground: "#2D2D2B",
  sidebarTop: "#F0F4F9", sidebarMint: "#E8F9F1", sidebarYellow: "#F6F9CC", sidebarBottom: "#F8F5DA", font: "app",
};
export const COLOR_FIELDS = ["accent", "background", "foreground", "sidebarTop", "sidebarMint", "sidebarYellow", "sidebarBottom"] as const;
export const validHex = (value: unknown): value is string => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
export function normalizeAppearance(value: unknown): Appearance {
  const next = { ...DEFAULT_APPEARANCE };
  if (!value || typeof value !== "object") return next;
  const source = value as Record<string, unknown>;
  for (const field of COLOR_FIELDS) if (validHex(source[field])) next[field] = source[field].toUpperCase();
  if (["light", "dark", "system"].includes(source.mode as string)) next.mode = source.mode as Appearance["mode"];
  if (["default", "ocean", "warm", "custom"].includes(source.theme as string)) next.theme = source.theme as Appearance["theme"];
  if (["app", "system", "serif"].includes(source.font as string)) next.font = source.font as Appearance["font"];
  return next;
}
export function readAppearance(userId?: string | null) { return normalizeAppearance(readAccountValue(APPEARANCE_KEY, userId)); }
export function appearancePreset(theme: Appearance["theme"]): Appearance {
  if (theme === "ocean") return { ...DEFAULT_APPEARANCE, theme, accent: "#087FA8", sidebarTop: "#EDF5FF", sidebarMint: "#DAF7F4", sidebarYellow: "#D4EFFF", sidebarBottom: "#E9F2FF" };
  if (theme === "warm") return { ...DEFAULT_APPEARANCE, theme, accent: "#CC7D5E", sidebarTop: "#F6F0EB", sidebarMint: "#F5EEE1", sidebarYellow: "#FFF0C9", sidebarBottom: "#F9E2D3" };
  return { ...DEFAULT_APPEARANCE, theme };
}
export function isOriginalGradient(a: Appearance) {
  return (["sidebarTop", "sidebarMint", "sidebarYellow", "sidebarBottom"] as const).every(key => a[key] === DEFAULT_APPEARANCE[key]);
}
export function appearanceTokens(a: Appearance, systemDark = false): Record<string, string> {
  const dark = a.mode === "dark" || (a.mode === "system" && systemDark);
  const bg = dark && a.background === DEFAULT_APPEARANCE.background ? "#202020" : a.background;
  const fg = dark && a.foreground === DEFAULT_APPEARANCE.foreground ? "#F1F1EF" : a.foreground;
  const tokens: Record<string, string> = {
    "--appearance-accent": a.accent, "--appearance-bg": bg, "--appearance-fg": fg,
    "--appearance-muted": `color-mix(in srgb, ${fg} 57%, ${bg})`,
    "--appearance-line": `color-mix(in srgb, ${fg} 12%, ${bg})`,
    "--appearance-soft": `color-mix(in srgb, ${fg} 6%, ${bg})`,
    "--appearance-hover": `color-mix(in srgb, ${fg} 8%, ${bg})`,
    "--appearance-sidebar-overlay": dark ? "rgb(20 20 20 / 82%)" : "rgb(255 255 255 / 66.6667%)",
  };
  if (!isOriginalGradient(a)) tokens["--dash-sidebar-gradient"] = `linear-gradient(180deg, ${a.sidebarTop} 0%, ${a.sidebarTop} 35%, ${a.sidebarMint} 47%, ${a.sidebarYellow} 74%, ${a.sidebarBottom} 100%)`;
  else if (dark) tokens["--dash-sidebar-gradient"] = "linear-gradient(180deg, #20252E 0%, #24332D 48%, #373823 78%, #333126 100%)";
  if (a.font === "system") tokens["--appearance-font"] = '"Segoe UI", system-ui, sans-serif';
  if (a.font === "serif") tokens["--appearance-font"] = 'Georgia, "Times New Roman", serif';
  return tokens;
}
