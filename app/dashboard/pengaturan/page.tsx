import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import { SettingsWorkspace } from "../../../components/dashboard/SettingsWorkspace";
export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk?next=/dashboard/pengaturan");
  const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  return <SettingsWorkspace name={name} email={user.email ?? ""} />;
}
