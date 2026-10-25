export const AI_CONIC =
  "conic-gradient(from 0deg, #ff0000, #ff8000, #ffee00, #00e600, #0099ff, #9933ff, #ff0000)";

// Teks "AI" superbold isi gradient conic (background-clip:text jalan di teks asli).
export function AiRainbowIcon({ className, size = 16 }: { className?: string; size?: string | number }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: AI_CONIC,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0",
        whiteSpace: "nowrap",
      }}
    >
      ✦
    </span>
  );
}
