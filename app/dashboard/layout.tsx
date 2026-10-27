import { redirect } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";
import { AccountProvider } from "../../components/dashboard/AccountContext";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import "../../components/dashboard/dashboard.css";
import "../../components/dashboard/shell.css";
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
      avatarUrl={
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : undefined
      }
    >
      {children}
    </DashboardShell>
    </AccountProvider>
  );
}
