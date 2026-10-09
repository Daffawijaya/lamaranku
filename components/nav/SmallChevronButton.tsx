"use client";

import { useState } from "react";
import { IoChevronForward } from "react-icons/io5";

type SmallChevronButtonProps = {
  title: string;
  onClick: () => void;
};

export default function SmallChevronButton({
  title,
  onClick,
}: SmallChevronButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        bg-white
        hover:bg-zinc-300
        transition-colors
        duration-500
        rounded-lg
        p-[2.5px]
        flex
        items-center
        shadow-lg
        w-fit
        cursor-pointer
      "
    >
      <span className="px-2 py-1 text-black text-sm font-medium">{title}</span>

      <span className="relative overflow-hidden w-8 h-8 bg-black rounded-md flex items-center justify-center">
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <linearGradient
              id="small-chevron-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" className="[stop-color:#a855f7]" />
              <stop offset="100%" className="[stop-color:#ffffff]" />
            </linearGradient>
          </defs>
        </svg>

        <IoChevronForward
          size={15}
          style={{
            fill: "url(#small-chevron-grad)",
            stroke: "url(#small-chevron-grad)",
          }}
          className={`absolute ${
            isHovered
              ? "translate-x-5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "translate-x-0 opacity-100 transition-none"
          }`}
        />

        <IoChevronForward
          size={15}
          style={{
            fill: "url(#small-chevron-grad)",
            stroke: "url(#small-chevron-grad)",
          }}
          className={`absolute ${
            isHovered
              ? "translate-x-0 opacity-100 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "-translate-x-5 opacity-0 transition-none"
          }`}
        />
      </span>
    </button>
  );
}
