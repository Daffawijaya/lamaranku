import { profileAvatar } from "../../../lib/supabase/avatar";
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import { ProfileWorkspace } from "../../../components/dashboard/ProfileWorkspace";
export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk?next=/dashboard/profil");
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  return <ProfileWorkspace name={name} email={user.email ?? ""} avatarUrl={await profileAvatar(supabase, user)} username={typeof user.user_metadata?.username === "string" ? user.user_metadata.username : ""} />;
}
