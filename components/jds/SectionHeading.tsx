import Link from "next/link";

interface SectionHeadingProps {
  badgeText?: string;
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
      {badgeText && (
        <span className={`text-sm font-semibold tracking-widest ${badgeColor} block mb-2`}>
          {badgeText}
        </span>
      )}
      <h2 className={`${titleClassName} font-bold tracking-tight leading-tight ${titleColor} mb-2`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`${subtitleColor} text-base sm:text-xl max-w-2xl mx-auto`}>
          {subtitle}
        </p>
      )}
      {button && (
        <Link
          href={button.href}
          className="inline-block mt-6 border border-white text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-white hover:text-black transition-colors"
        >
          {button.label}
        </Link>
      )}
    </div>
  );
}
