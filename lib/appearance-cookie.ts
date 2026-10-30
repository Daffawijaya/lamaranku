import { normalizeAppearance, type Appearance } from "./appearance";

export const APPEARANCE_COOKIE = "lamaranku_dashboard_appearance";
export function readAppearanceCookie(raw: string | undefined, userId: string) {
  try {
    if (!raw || raw.length > 3800) return null;
    const data = JSON.parse(decodeURIComponent(raw));
    if (data.userId !== userId) return null;
    return { appearance: normalizeAppearance(data.appearance), systemDark: data.systemDark === true };
  } catch { return null; }
}
export function writeAppearanceCookie(appearance: Appearance, userId: string | null, systemDark: boolean) {
  if (!userId || typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify({ userId, appearance: normalizeAppearance(appearance), systemDark }));
  if (value.length > 3800) return;
  document.cookie = `${APPEARANCE_COOKIE}=${value}; Path=/dashboard; Max-Age=31536000; SameSite=Lax${typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : ""}`;
}
