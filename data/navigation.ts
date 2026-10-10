import type { IconType } from "react-icons";
import { FaEnvelope, FaFileAlt, FaFolderOpen, FaTachometerAlt } from "react-icons/fa";

export interface NavItem {
  label: string;
  href: string;
  desc: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
}

export const navigation: NavItem[] = [
  {
    label: "CV Builder",
    href: "/cv-builder",
    desc: "10 template ATS dan Kreatif",
    icon: FaFileAlt,
    iconBg: "bg-[#eb1000]",
    iconColor: "text-white",
  },
  {
    label: "Cek Skor CV",
    href: "/skor",
    desc: "Nilai kesiapan ATS dalam 2 menit",
    icon: FaTachometerAlt,
    iconBg: "bg-[#001e36]",
    iconColor: "text-[#31a8ff]",
  },
  {
    label: "Portfolio Builder",
    href: "/portfolio",
    desc: "Kumpulkan karya dalam satu halaman",
    icon: FaFolderOpen,
    iconBg: "bg-[#330000]",
    iconColor: "text-[#ff9a00]",
  },
  {
    label: "Generator Surat",
    href: "/surat",
    desc: "Surat siap kirim, 3x gratis tiap bulan",
    icon: FaEnvelope,
    iconBg: "bg-[#49021f]",
    iconColor: "text-[#ff3366]",
  },
];

export const sectionLinks = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Harga", href: "/#harga" },
];
