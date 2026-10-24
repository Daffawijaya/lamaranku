import Link from "next/link";
import { LiquidGlassSidebar } from "./glass/liquid-glass-sidebar";
import { dashboardToolForPath, sidebarItems } from "./navigation";
export function DashboardNavigation({ path }: { path: string }) {
  return (
    <aside className="workspace-sidebar">
      <Link
        href="/dashboard"
        aria-label="Lamaranku beranda"
        className="workspace-brand"
      >
        lamaranku.
      </Link>
      <div className="mt-3">
        <LiquidGlassSidebar
          items={sidebarItems}
          value={dashboardToolForPath(path).href}
          ariaLabel="Navigasi dashboard"
        />
      </div>
    </aside>
  );
}
