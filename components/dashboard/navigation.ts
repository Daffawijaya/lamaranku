import {
  LayoutDashboard,
  FileText,
  ScanText,
  BriefcaseBusiness,
  Mail,
} from "lucide-react";
export const dashboardTools = [
  {
    href: "/dashboard",
    title: "Ringkasan",
    description: "Ruang kerja lamaranmu",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/cv-builder",
    title: "CV Builder",
    description: "Susun CV yang menceritakan potensimu.",
    icon: FileText,
  },
  {
    href: "/dashboard/skor",
    title: "Review CV",
    description: "Dapatkan saran perbaikan dengan AI.",
    icon: ScanText,
  },
  {
    href: "/dashboard/portfolio",
    title: "Portofolio",
    description: "Kumpulkan karya dan pengalaman terbaik.",
    icon: BriefcaseBusiness,
  },
  {
    href: "/dashboard/surat",
    title: "Surat lamaran",
    description: "Tulis pembuka untuk peluang berikutnya.",
    icon: Mail,
  },
] as const;
export function currentDashboardTool(path: string) {
  return (
    dashboardTools.find(
      (t) =>
        t.href === path ||
        (t.href !== "/dashboard" && path.startsWith(t.href + "/")),
    ) ?? dashboardTools[0]
  );
}
