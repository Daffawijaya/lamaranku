// Legacy, unowned records are never claimed by a signed-in account.
export function accountStorageKey(base: string, userId?: string | null) {
  return userId ? `${base}:user:${encodeURIComponent(userId)}` : base;
}
export function readAccountValue(base: string, userId?: string | null): unknown {
  try { return JSON.parse(localStorage.getItem(accountStorageKey(base, userId)) ?? "null"); }
  catch { return null; }
}
export function writeAccountValue(base: string, value: unknown, userId?: string | null) {
  localStorage.setItem(accountStorageKey(base, userId), JSON.stringify(value));
}
// Preferensi tampilan, bukan data pribadi — tetap dipertahankan saat keluar.
const KEEP_ON_LOGOUT = new Set([
  "lamaranku_appearance",
  "lamaranku_dashboard_preferences",
  "lamaranku_sidebar_expanded",
]);
// Berkas menunggu review disimpan sementara di IndexedDB; isinya CV pengguna.
const PENDING_REVIEW_DB = "lamaranku-pending-review";
/**
 * Hapus semua data akun ini dari penyimpanan browser (cache CV, draft surat,
 * draft portofolio/website, draf review). Dipanggil saat keluar supaya
 * perangkat bersama tidak menyisakan data pribadi.
 */
export function clearAccountStorage(userId: string) {
  const suffix = `:user:${encodeURIComponent(userId)}`;
  try {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.endsWith(suffix)) continue;
      const base = key.slice(0, key.length - suffix.length);
      if (!KEEP_ON_LOGOUT.has(base)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch { /* penyimpanan diblokir: tidak ada yang bisa dihapus */ }
  try {
    if (typeof indexedDB !== "undefined") indexedDB.deleteDatabase(PENDING_REVIEW_DB);
  } catch { /* biarkan senyap */ }
}
