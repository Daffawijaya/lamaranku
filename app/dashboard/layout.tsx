import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
export const metadata = { title: "Dashboard Lamaranku" };
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/masuk?next=/dashboard");
  return <DashboardShell email={user.email || "Akun Lamaranku"}>{children}</DashboardShell>;
}
