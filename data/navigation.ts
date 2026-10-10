import type { IconType } from "react-icons";
import { FaFolderOpen, FaTachometerAlt } from "react-icons/fa";
import { BiLogoGmail } from "react-icons/bi";
import { TbFileTextFilled } from "react-icons/tb";

export interface NavItem {
  label: string;
  href: string;
  desc: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  iconSize?: string;
}

export const navigation: NavItem[] = [
  {
    label: "CV Builder",
    href: "/cv-builder",
    desc: "10 template ATS dan Kreatif",
    icon: TbFileTextFilled,
    iconBg: "bg-[#eb1000]",
    iconColor: "text-white",
    iconSize: "h-3.5 w-3.5",
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
    icon: BiLogoGmail,
    iconBg: "bg-[#49021f]",
    iconColor: "text-[#ff3366]",
    iconSize: "h-3.5 w-3.5",
  },
];

export const sectionLinks = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Harga", href: "/#harga" },
];
