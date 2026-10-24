"use client";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase/client";
import { DashboardNavigation } from "./DashboardNavigation";
import { DashboardHeader } from "./DashboardHeader";
import { MobileBottomnav } from "./glass/mobile-bottomnav";
import { FxFilterLoader } from "./glass/fx-filter-loader";
import { dashboardToolForPath, mobileItems } from "./navigation";
function subscribeDesktop(callback: () => void) {
  const mq = window.matchMedia("(min-width:768px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const desktopSnapshot = () => window.matchMedia("(min-width:768px)").matches;
const serverSnapshot = () => false;
export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    serverSnapshot,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      setDark(localStorage.getItem("lamaranku_dashboard_theme") === "dark");
    } catch {}
  }, []);
  function toggleTheme() {
    setDark((value) => {
      try {
        localStorage.setItem(
          "lamaranku_dashboard_theme",
          value ? "light" : "dark",
        );
      } catch {}
      return !value;
    });
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabaseBrowser().auth.signOut();
      if (error) throw error;
      router.replace("/masuk");
      router.refresh();
    } catch {
      setError("Gagal keluar. Coba lagi.");
      setBusy(false);
    }
  }
  return (
    <div className={dark ? "workspace dark" : "workspace"}>
      <FxFilterLoader />
      <a href="#workspace-content" className="workspace-skip">
        Langsung ke konten
      </a>
      <div
        className={desktop ? "ref-shell workspace-desktop" : "workspace-mobile"}
      >
        {desktop && <DashboardNavigation path={path} />}
        <div className="workspace-body">
          <DashboardHeader
            title={dashboardToolForPath(path).title}
            email={email}
            busy={busy}
            dark={dark}
            onToggleTheme={toggleTheme}
            onLogout={() => void logout()}
          />
          <main id="workspace-content" className="workspace-content">
            {error && (
              <p role="alert" className="workspace-error">
                {error}
              </p>
            )}
            {children}
          </main>
        </div>
        {!desktop && <MobileBottomnav items={mobileItems} />}
      </div>
    </div>
  );
}
