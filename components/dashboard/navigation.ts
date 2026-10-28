import {
  LayoutDashboard,
  FileText,
  ScanText,
  BriefcaseBusiness,
  Mail,
  UserRound,
  Settings,
} from "lucide-react";
import { HiHome, HiDocumentText, HiDocumentMagnifyingGlass, HiBriefcase, HiEnvelope } from "react-icons/hi2";
export const dashboardTools = [
  {
    href: "/dashboard",
    title: "Ringkasan",
    pageTitle: "Ringkasan",
    description: "Ruang kerja lamaranmu",
    icon: LayoutDashboard,
    activeIcon: HiHome,
  },
  {
    href: "/dashboard/cv-builder",
    title: "CV Builder",
    pageTitle: "Buat cerita kariermu",
    description: "Susun CV yang menceritakan potensimu.",
    icon: FileText,
    activeIcon: HiDocumentText,
  },
  {
    href: "/dashboard/skor",
    title: "Review CV",
    pageTitle: "Kenali kekuatan CV-mu.",
    description: "Dapatkan saran perbaikan dengan AI.",
    icon: ScanText,
    activeIcon: HiDocumentMagnifyingGlass,
  },
  {
    href: "/dashboard/portfolio",
    title: "Portofolio",
    pageTitle: "Biar karyamu yang bercerita.",
    description: "Kumpulkan karya dan pengalaman terbaik.",
    icon: BriefcaseBusiness,
    activeIcon: HiBriefcase,
  },
  {
    href: "/dashboard/surat",
    title: "Surat lamaran",
    pageTitle: "Buka percakapan yang tepat.",
    description: "Tulis pembuka untuk peluang berikutnya.",
    icon: Mail,
    activeIcon: HiEnvelope,
  },
] as const;
export function currentDashboardTool(path: string) {
  if (path === "/dashboard/profil") return { href: path, title: "Profil", pageTitle: "Profil akun", description: "Kelola identitas akunmu.", icon: UserRound, activeIcon: UserRound };
  if (path === "/dashboard/pengaturan") return { href: path, title: "Settings", pageTitle: "Pengaturan akun", description: "Kelola akun Lamaranku.", icon: Settings, activeIcon: Settings };
  return (
    dashboardTools.find(
      (t) =>
        t.href === path ||
        (t.href !== "/dashboard" && path.startsWith(t.href + "/")),
    ) ?? dashboardTools[0]
  );
}
