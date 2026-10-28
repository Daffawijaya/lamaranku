import { DASHBOARD_FONTS, type DashboardFont } from "./dashboard-fonts";
import { readAccountValue } from "./account-storage";

export const THEMES = [
  { id: "default", label: "Default" }, { id: "ocean", label: "Ocean" },
  { id: "warm", label: "Warm" }, { id: "forest", label: "Forest" },
  { id: "lavender", label: "Lavender" }, { id: "rose", label: "Rose" },
  { id: "sunset", label: "Sunset" }, { id: "slate", label: "Slate" },
  { id: "cobalt", label: "Cobalt" }, { id: "citrus", label: "Citrus" },
  { id: "cherry", label: "Cherry" }, { id: "sand", label: "Desert" },
  { id: "mint", label: "Mint Pop" }, { id: "orchid", label: "Orchid" },
  { id: "cyberpunk", label: "Cyberpunk" }, { id: "terminal", label: "Terminal" },
  { id: "arctic", label: "Arctic" }, { id: "terracotta", label: "Terracotta" },
] as const;
export const ACCENTS = [
  { id: "blue", label: "Blue", color: "#3564FA" },
  { id: "green", label: "Green", color: "#00B89C" },
  { id: "yellow", label: "Yellow", color: "#FFCD32" },
  { id: "pink", label: "Pink", color: "#F967A9" },
  { id: "orange", label: "Orange", color: "#FF7C63" },
  { id: "purple", label: "Purple", color: "#A653F5" },
  { id: "black", label: "Black", color: "#000000" },
] as const;
export type AccentChoice = "default" | "custom" | typeof ACCENTS[number]["id"];
type ModeColors = { background: string; foreground: string };
export type Appearance = {
  accentChoice?: AccentChoice;
  colorsByMode?: Partial<Record<"light" | "dark", ModeColors>>;
  baseTheme?: typeof THEMES[number]["id"];
  mode: "system" | "light" | "dark";
  theme: typeof THEMES[number]["id"] | "custom";
  accent: string; background: string; foreground: string;
  sidebarTop: string; sidebarMint: string; sidebarYellow: string; sidebarBottom: string;
  font: DashboardFont;
};
export const APPEARANCE_KEY = "lamaranku_appearance";
export const DEFAULT_APPEARANCE: Appearance = {
  mode: "system", theme: "default", accent: "#3B63FB", background: "#FFFFFF", foreground: "#2D2D2B",
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
  if ([...THEMES.map(theme => theme.id), "custom"].includes(source.theme as string)) next.theme = source.theme as Appearance["theme"];
  if (DASHBOARD_FONTS.some(font => font.value === source.font)) next.font = source.font as Appearance["font"];
  if (["default", "custom", ...ACCENTS.map(accent => accent.id)].includes(source.accentChoice as string)) next.accentChoice = source.accentChoice as AccentChoice;
  if (THEMES.some(theme => theme.id === source.baseTheme)) next.baseTheme = source.baseTheme as Appearance["baseTheme"];
  if (source.colorsByMode && typeof source.colorsByMode === "object") {
    const colors = source.colorsByMode as Record<string, unknown>;
    for (const mode of ["light", "dark"] as const) {
      const pair = colors[mode] as Partial<ModeColors> | undefined;
      if (pair && validHex(pair.background) && validHex(pair.foreground)) {
        next.colorsByMode = { ...next.colorsByMode, [mode]: { background: pair.background.toUpperCase(), foreground: pair.foreground.toUpperCase() } };
      }
    }
  }
  return next.theme === "custom" || !THEMES.some(theme => theme.id === source.theme) ? next : { ...appearancePreset(next.theme), mode: next.mode, font: next.font };
}
export function readAppearance(userId?: string | null) { return normalizeAppearance(readAccountValue(APPEARANCE_KEY, userId)); }
export function appearancePreset(theme: Appearance["theme"]): Appearance {
  // Every palette owns the complete workspace, including the fixed sidebar gradient.
  const palettes = {
    cyberpunk: ["#B52FE5", "#F1DFFF", "#35124E", "#E9C5FF", "#B2F1EE", "#F2F1A0", "#F5B8E9"],
    terminal: ["#238C58", "#DFEBE3", "#1B3528", "#C7DDCF", "#A9D8BC", "#CEDCAE", "#B4D5CB"],
    ocean: ["#087FA8", "#DCEFF6", "#153C50", "#CCE8F5", "#B4E7E3", "#BBDDF4", "#D4E4FA"],
    warm: ["#CC7D5E", "#F5E8D8", "#493327", "#EFE0CE", "#F0D8B9", "#F8DDA4", "#EDC6AE"],
    forest: ["#267354", "#DDEBDC", "#203D2E", "#D0E5D3", "#ADD5BB", "#CDDBA6", "#DFE5BB"],
    lavender: ["#7954B3", "#E9DFF6", "#3D2B58", "#DFD0F1", "#D0B9EE", "#C6CEF4", "#E9C9E9"],
    rose: ["#B84D75", "#F8DFE9", "#52283B", "#F4D1E0", "#ECB5D0", "#F6CCC4", "#EDBCD2"],
    sunset: ["#B85F36", "#FFE1CF", "#573024", "#FFD4AF", "#FFC4A9", "#FFDB9B", "#F1B2CE"],
    slate: ["#52647D", "#DFE5EE", "#29384E", "#D5DEEA", "#BFCEDD", "#CFD6E4", "#DBDCEC"],
    cobalt: ["#244BDD", "#D4E0FF", "#172B64", "#BDD1FF", "#AEC5FA", "#C0C9FF", "#D4C3FF"],
    citrus: ["#627512", "#EFF3BC", "#39451B", "#E7EEA2", "#CDDE87", "#F4E894", "#F5D8A0"],
    cherry: ["#BC274D", "#FFDDE1", "#631E32", "#F9C7D0", "#F2A8BC", "#F8BEC0", "#EAB3D4"],
    sand: ["#926221", "#EDDFC5", "#493923", "#E4CCA8", "#DDC49A", "#EBD6A5", "#D8C6A9"],
    mint: ["#087D70", "#CFF3E8", "#164A40", "#B7EBDC", "#9FE3CF", "#D3EEB1", "#BAEAD9"],
    orchid: ["#A52DA7", "#F0D7F5", "#54245E", "#E9BFF1", "#E6A8E5", "#D5B5F5", "#F2BBD8"],
    arctic: ["#176E9D", "#D8F0F4", "#234653", "#C5E4F0", "#A8DFE8", "#C3E3F8", "#CEDCF1"],
    terracotta: ["#AC462B", "#F2D7C8", "#562D24", "#EBC3AE", "#E4AE97", "#EDCA9D", "#DEB6A2"],
  };
  if (theme in palettes) {
    const [accent, background, foreground, sidebarTop, sidebarMint, sidebarYellow, sidebarBottom] = palettes[theme as keyof typeof palettes];
    return { ...DEFAULT_APPEARANCE, theme, accent, background, foreground, sidebarTop, sidebarMint, sidebarYellow, sidebarBottom };
  }
  return { ...DEFAULT_APPEARANCE, theme };
}

export function isOriginalGradient(a: Appearance) {
  return (["sidebarTop", "sidebarMint", "sidebarYellow", "sidebarBottom"] as const).every(key => a[key] === DEFAULT_APPEARANCE[key]);
}
export function effectiveDark(a: Appearance, systemDark = false) {
  return a.mode === "dark" || (a.mode === "system" && systemDark);
}
function mixHex(color: string, target: string, amount: number) {
  return "#" + [1, 3, 5].map(offset => Math.round(parseInt(color.slice(offset, offset + 2), 16) * amount + parseInt(target.slice(offset, offset + 2), 16) * (1 - amount)).toString(16).padStart(2, "0")).join("").toUpperCase();
}
export function appearanceColors(a: Appearance, dark: boolean): ModeColors {
  const saved = a.colorsByMode?.[dark ? "dark" : "light"];
  if (saved) return saved;
  if (!dark) return { background: a.background, foreground: a.foreground };
  const theme = a.baseTheme ?? a.theme;
  if (theme === "cyberpunk") return { background: "#170D28", foreground: "#F3E4FF" };
  if (theme === "terminal") return { background: "#0D1713", foreground: "#C7E8D2" };
  if (theme !== "default" && theme !== "custom") return { background: mixHex(a.background, "#10141C", .1), foreground: mixHex(a.background, "#FFFFFF", .18) };
  return { background: a.background === DEFAULT_APPEARANCE.background ? "#10141C" : a.background, foreground: a.foreground === DEFAULT_APPEARANCE.foreground ? "#C5C5C0" : a.foreground };
}
export function selectedAccent(a: Appearance): AccentChoice {
  if (a.accentChoice) return a.accentChoice;
  const base = appearancePreset(a.baseTheme ?? (a.theme === "custom" ? "default" : a.theme));
  return a.accent === base.accent ? "default" : ACCENTS.find(option => option.color === a.accent)?.id ?? "custom";
}
export function updateAccent(a: Appearance, choice: AccentChoice): Appearance {
  const accent = choice === "custom" ? a.accent : choice === "default"
    ? appearancePreset(a.baseTheme ?? (a.theme === "custom" ? "default" : a.theme)).accent
    : ACCENTS.find(option => option.id === choice)!.color;
  return customizeAppearance(a, { accent, accentChoice: choice });
}
export function customizeAppearance(a: Appearance, patch: Partial<Appearance>): Appearance {
  return { ...a, colorsByMode: { light: appearanceColors(a, false), dark: appearanceColors(a, true) }, ...patch, baseTheme: a.baseTheme ?? (a.theme === "custom" ? "default" : a.theme), theme: "custom" };
}
export function updateAppearanceColor(a: Appearance, field: keyof ModeColors, color: string, systemDark = false): Appearance {
  const next = customizeAppearance(a, {});
  const mode = effectiveDark(a, systemDark) ? "dark" : "light";
  return { ...next, colorsByMode: { ...next.colorsByMode, [mode]: { ...appearanceColors(a, mode === "dark"), [field]: color } } };
}
export function appearanceTokens(a: Appearance, systemDark = false): Record<string, string> {
  const dark = effectiveDark(a, systemDark);
  const paletteTheme = a.baseTheme ?? a.theme;
  const presetDark = dark && paletteTheme !== "default" && paletteTheme !== "custom";
  const { background: bg, foreground: fg } = appearanceColors(a, dark);
  const channels = [1, 3, 5].map(offset => parseInt(a.accent.slice(offset, offset + 2), 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  const tokens: Record<string, string> = {
    "--appearance-on-accent": luminance > .179 ? "#171717" : "#FFFFFF",
    "--appearance-accent": a.accent, "--appearance-bg": bg, "--appearance-fg": fg,
    "--appearance-muted": `color-mix(in srgb, ${fg} 57%, ${bg})`,
    "--appearance-line": `color-mix(in srgb, ${fg} 12%, ${bg})`,
    "--appearance-soft": `color-mix(in srgb, ${fg} 6%, ${bg})`,
    "--appearance-hover": `color-mix(in srgb, ${fg} 8%, ${bg})`,
    "--appearance-sidebar-overlay": paletteTheme === "default" ? (dark ? "rgb(16 21 28 / 66.6667%)" : "rgb(255 255 255 / 66.6667%)") : `color-mix(in srgb, ${bg} 66.6667%, transparent)`,
  };
  const stop = (color: string) => presetDark ? `color-mix(in srgb, ${color} 18%, #10141C)` : color;
  if (!isOriginalGradient(a)) tokens["--dash-sidebar-gradient"] = `linear-gradient(180deg, ${stop(a.sidebarTop)} 0%, ${stop(a.sidebarTop)} 35%, ${stop(a.sidebarMint)} 47%, ${stop(a.sidebarYellow)} 74%, ${stop(a.sidebarBottom)} 100%)`;
  else if (dark) tokens["--dash-sidebar-gradient"] = "linear-gradient(180deg, #1A212C 0%, #1A212B 15%, #1C231A 52%, #21211A 90%, #22211A 100%)";
  const font = DASHBOARD_FONTS.find(font => font.value === a.font);
  if (font && a.font !== "app") tokens["--appearance-font"] = font.family;
  return tokens;
}
