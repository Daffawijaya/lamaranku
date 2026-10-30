import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import { profileAvatar } from "../../lib/supabase/avatar";
import { AccountProvider } from "../../components/dashboard/AccountContext";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import "../../components/dashboard/dashboard.css";
import "../../components/dashboard/shell.css";
import "../../components/dashboard/theme.css";
import "../../components/dashboard/ui.css";
export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk?next=/dashboard");
  const avatarUrl = await profileAvatar(supabase, user);
  return (
    <AccountProvider userId={user.id} key={user.id}>
    <DashboardShell
      email={user.email || "Akun Lamaranku"}
      name={
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : undefined
      }
      avatarUrl={avatarUrl}
    >
      {children}
    </DashboardShell>
    </AccountProvider>
  );
}
