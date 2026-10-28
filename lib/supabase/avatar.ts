import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function profileAvatar(supabase: SupabaseClient, user: User): Promise<string> {
  const path: unknown = user.user_metadata?.avatar_path;
  if (typeof path === "string" && path.startsWith(`${user.id}/`)) {
    const { data } = await supabase.storage.from("profile-avatars").createSignedUrl(path, 86400);
    if (data?.signedUrl) return data.signedUrl;
  }
  const fallback: unknown = user.user_metadata?.avatar_url;
  return typeof fallback === "string" && /^https:\/\//i.test(fallback) ? fallback : "";
}
