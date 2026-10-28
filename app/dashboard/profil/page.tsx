import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import { AccountSettings } from "../../../components/dashboard/AccountSettings";
export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk?next=/dashboard/profil");
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  return <AccountSettings name={name} email={user.email ?? ""} />;
}
