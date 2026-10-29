import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  badgeText?: string;
  badgeIcon?: ReactNode;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  button?: { label: string; href: string };
  dark?: boolean;
}

export function SectionHeading({
  badgeText,
  badgeIcon,
  title,
  subtitle,
  align = "center",
  className = "",
  titleClassName = "text-3xl sm:text-5xl",
  button,
  dark = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const titleColor = dark ? "text-white" : "text-zinc-900";
  const subtitleColor = dark ? "text-zinc-300" : "text-black";
  const badgeColor = dark ? "text-zinc-400" : "text-zinc-500";

  return (
    <div className={`max-w-3xl ${alignClass} ${className}`}>
      {(badgeIcon ?? badgeText) && (
        <span className={`text-sm font-semibold tracking-widest ${badgeColor} mb-2 ${badgeIcon && badgeText ? "inline-flex items-center justify-center gap-2" : "block"}`}>
          {badgeIcon}
          <T text={badgeText} />
        </span>
      )}
      <h2 className={`${titleClassName} font-bold tracking-tight leading-tight ${titleColor} mb-2`}>
        <T text={title} />
      </h2>
      {subtitle && (
        <p className={`${subtitleColor} text-base sm:text-xl max-w-2xl mx-auto`}>
          <T text={subtitle} />
        </p>
      )}
      {button && (
        <Link
          href={button.href}
          className="inline-block mt-6 border border-white text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-white hover:text-black transition-colors"
        >
          <T text={button.label} />
        </Link>
      )}
    </div>
  );
}
