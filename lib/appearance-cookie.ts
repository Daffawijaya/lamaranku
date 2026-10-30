import { DEFAULT_APPEARANCE, normalizeAppearance, type Appearance } from "./appearance";

export const APPEARANCE_COOKIE = "lamaranku_dashboard_appearance";
export function readAppearanceCookie(raw: string | undefined, userId: string) {
  try {
    if (!raw || raw.length > 3800) return null;
    const data = JSON.parse(decodeURIComponent(raw));
    if ((data.u ?? data.userId) !== userId) return null;
    return { appearance: normalizeAppearance(data.a ?? data.appearance), systemDark: (data.d ?? data.systemDark) === true };
  } catch { return null; }
}
export function writeAppearanceCookie(appearance: Appearance, userId: string | null, systemDark: boolean) {
  if (!userId || typeof document === "undefined") return;
  const normalized = normalizeAppearance(appearance);
  const defaults = DEFAULT_APPEARANCE as unknown as Record<string, unknown>;
  const compact = Object.fromEntries(Object.entries(normalized).filter(([key, value]) => value !== defaults[key]));
  const value = encodeURIComponent(JSON.stringify({ u: userId, a: compact, d: systemDark }));
  if (value.length > 1800) return;
  if (document.cookie.split("; ").includes(`${APPEARANCE_COOKIE}=${value}`)) return;
  document.cookie = `${APPEARANCE_COOKIE}=${value}; Path=/dashboard; Max-Age=31536000; SameSite=Lax${typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : ""}`;
}
