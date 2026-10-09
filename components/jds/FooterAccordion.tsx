"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export default function FooterAccordion({
  title,
  dark,
  children,
}: {
  title: string;
  dark: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b ${dark ? "border-white/10" : "border-black/10"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between px-2 py-[22px] text-left text-[15px] font-bold ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 motion-reduce:transition-none! ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none! ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-2 pb-[22px] text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
