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
