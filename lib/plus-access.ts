// app_metadata is assigned by Supabase admins, unlike user_metadata/localStorage.
export function hasActivePlus(user: { app_metadata?: Record<string, unknown> }, now = Date.now()) {
  const metadata = user.app_metadata;
  if (metadata?.plan !== "plus") return false;
  if (metadata.plus_until == null) return true;
  return typeof metadata.plus_until === "string" && Date.parse(metadata.plus_until) > now;
}
