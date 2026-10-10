import type { IconType } from "react-icons";
import { FaEnvelope, FaFileAlt, FaFolderOpen, FaTachometerAlt } from "react-icons/fa";

export interface NavItem {
  label: string;
  href: string;
  desc: string;
  icon: IconType;
  iconBg: string;
}

export const navigation: NavItem[] = [
  {
    label: "CV Builder",
    href: "/cv-builder",
    desc: "10 template ATS dan Kreatif",
    icon: FaFileAlt,
    iconBg: "bg-[#FA0F00]",
  },
  {
    label: "Cek Skor CV",
    href: "/skor",
    desc: "Nilai kesiapan ATS dalam 2 menit",
    icon: FaTachometerAlt,
    iconBg: "bg-[#1473E6]",
  },
  {
    label: "Portfolio Builder",
    href: "/portfolio",
    desc: "Kumpulkan karya dalam satu halaman",
    icon: FaFolderOpen,
    iconBg: "bg-[#7C3AED]",
  },
  {
    label: "Generator Surat",
    href: "/surat",
    desc: "Surat siap kirim, 3x gratis tiap bulan",
    icon: FaEnvelope,
    iconBg: "bg-[#057642]",
  },
];

export const sectionLinks = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Harga", href: "/#harga" },
];
