import type { ReactNode } from "react";

interface PageIntroProps {
  label: string;
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  align?: "left" | "center";
  titleClassName?: string;
  descriptionClassName?: string;
}

export function PageIntro({
  label,
  title,
  description,
  icon,
  align = "left",
  titleClassName = "",
  descriptionClassName = "",
}: PageIntroProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "flex flex-col items-center text-center" : undefined}>
      <div className={`mb-5 flex items-center text-lg font-bold ${icon ? "gap-3" : "gap-0"}`}>
        {icon}
        <span>{label}</span>
      </div>
      <h1
        className={`text-4xl font-bold leading-[1.25] tracking-[-0.03em] sm:text-[2.5rem] lg:text-[2.75rem] ${titleClassName}`}
      >
        {title}
      </h1>
      <p className={`mt-5 text-lg leading-7 text-[#3f3f3f] ${descriptionClassName}`}>{description}</p>
    </div>
  );
}
