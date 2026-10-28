"use client";

type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
};

export function FilterTabs<T extends string>({ options, value, onChange, label, size = "md", className = "" }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={`inline-flex shrink-0 items-center rounded-[10px] bg-[#f3f3f3] p-0.5 ${className}`}>
      {options.map(option => (
        <button key={option.value} type="button" aria-pressed={value === option.value}
          onClick={() => { if (value !== option.value) onChange(option.value); }}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] ${
            size === "sm" ? "min-h-7 px-3 py-1 text-[11px] leading-5" : "min-h-10 px-3 py-2 text-base leading-6"
          } ${value === option.value ? "bg-[#222222] text-white" : "bg-transparent text-[#505050] hover:bg-[#e8e8e8] hover:text-black"}`}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
