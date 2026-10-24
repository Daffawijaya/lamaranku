import {
  HiHome,
  HiOutlineHome,
  HiDocumentText,
  HiOutlineDocumentText,
  HiChartBarSquare,
  HiOutlineChartBarSquare,
  HiBriefcase,
  HiOutlineBriefcase,
  HiEnvelope,
  HiOutlineEnvelope,
} from "react-icons/hi2";
export const dashboardTools = [
  {
    href: "/dashboard",
    title: "Beranda",
    mobileTitle: "Beranda",
    description: "Ruang kerja lamaranmu",
    IdleIcon: HiOutlineHome,
    ActiveIcon: HiHome,
  },
  {
    href: "/dashboard/cv-builder",
    title: "CV Builder",
    mobileTitle: "CV",
    description: "Susun, simpan, dan unduh CV profesional.",
    IdleIcon: HiOutlineDocumentText,
    ActiveIcon: HiDocumentText,
  },
  {
    href: "/dashboard/skor",
    title: "Review CV",
    mobileTitle: "Review",
    description: "Evaluasi CV dan kecocokan lowongan dengan AI.",
    IdleIcon: HiOutlineChartBarSquare,
    ActiveIcon: HiChartBarSquare,
  },
  {
    href: "/dashboard/portfolio",
    title: "Portofolio",
    mobileTitle: "Portofolio",
    description: "Tampilkan pengalaman dan karya terbaikmu.",
    IdleIcon: HiOutlineBriefcase,
    ActiveIcon: HiBriefcase,
  },
  {
    href: "/dashboard/surat",
    title: "Surat lamaran",
    mobileTitle: "Surat",
    description: "Siapkan surat untuk perusahaan tujuan.",
    IdleIcon: HiOutlineEnvelope,
    ActiveIcon: HiEnvelope,
  },
] as const;
export const sidebarItems = dashboardTools.map((t) => ({
  key: t.href,
  label: t.title,
  href: t.href,
  IdleIcon: t.IdleIcon,
  ActiveIcon: t.ActiveIcon,
}));
export const mobileItems = dashboardTools.map((t) => ({
  key: t.href,
  label: t.mobileTitle,
  href: t.href,
  IdleIcon: t.IdleIcon,
  ActiveIcon: t.ActiveIcon,
}));
export function dashboardToolForPath(path: string) {
  return (
    dashboardTools.find(
      (t) =>
        t.href === path ||
        (t.href !== "/dashboard" && path.startsWith(t.href + "/")),
    ) ?? dashboardTools[0]
  );
}
