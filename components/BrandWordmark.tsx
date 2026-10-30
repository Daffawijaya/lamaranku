const BRAND_NAME = "Lamaranku.";

/** Full text wordmark; inherits the surrounding navbar's color and font. */
export function BrandWordmark({ className = "" }: { className?: string }) {
  return <span className={`whitespace-nowrap ${className}`}>{BRAND_NAME}</span>;
}
