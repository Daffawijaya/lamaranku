import type { CookieOptions } from "@supabase/ssr";

export const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

// Apply at the cookie writer: @supabase/ssr overrides cookieOptions.maxAge
// with its own default when persisting tokens. Preserve logout/chunk deletion.
// Cookie shared browser + server jadi tidak bisa httpOnly (klien membaca sesi
// sendiri), tapi HTTPS ditegakkan di produksi dan SameSite tetap lax.
export function sessionCookieOptions(options: CookieOptions): CookieOptions {
  if (options.maxAge !== undefined && options.maxAge <= 0) return options;
  return {
    ...options,
    maxAge: SESSION_COOKIE_MAX_AGE,
    sameSite: options.sameSite ?? "lax",
    secure: process.env.NODE_ENV === "production" ? true : options.secure,
  };
}
