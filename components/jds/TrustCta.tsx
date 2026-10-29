import { T, LocalizedAttributes } from "../i18n/LanguageProvider";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TrustCta({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primary: { label: string; href: string; external?: boolean };
  secondary?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section className="bg-[#191919] py-14 sm:py-20 text-white">
      <div className="mx-auto max-w-[1310px] px-5 text-center sm:px-4 lg:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-400"><T text={eyebrow} /></p>
        <h2 className="text-2xl sm:text-3xl font-bold"><T text={title} /></h2>
        <p className="mx-auto mb-12 mt-2 max-w-2xl text-gray-400"><T text={description} /></p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CtaLink action={primary} primary />
          {secondary && <CtaLink action={secondary} />}
        </div>
      </div>
    </section>
  );
}

function CtaLink({
  action,
  primary = false,
}: {
  action: { label: string; href: string; external?: boolean };
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#1473E6] px-8 py-3 text-base sm:text-lg font-semibold text-white transition-colors hover:bg-blue-700"
    : "inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-gray-500 px-8 py-3 text-base sm:text-lg font-semibold text-white transition-colors hover:bg-gray-800";
  const content = <><T text={action.label} />{primary && <ArrowRight className="h-4 w-4" />}</>;

  return action.external ? (
    <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  ) : (
    <Link href={action.href} className={className}>{content}</Link>
  );
}
