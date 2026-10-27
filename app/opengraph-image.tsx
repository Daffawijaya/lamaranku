import { ImageResponse } from "next/og";

export const alt = "Lamaranku — CV ATS dan Portofolio Gratis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f4f5", padding: "70px 80px", fontFamily: "sans-serif", color: "#18181b" }}>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>lamaranku.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.12 }}>
          <span>CV ATS dan portofolio.</span>
          <span>Gratis untuk mulai.</span>
        </div>
        <div style={{ fontSize: 28, color: "#52525b" }}>Pilih template. Isi pengalamanmu. Unduh PDF.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 23 }}>
        <div style={{ display: "flex", padding: "14px 24px", borderRadius: 40, background: "#3b63fb", color: "white" }}>CV Builder</div>
        <div style={{ display: "flex", padding: "14px 24px", borderRadius: 40, background: "white" }}>Portofolio</div>
        <div style={{ display: "flex", padding: "14px 24px", borderRadius: 40, background: "white" }}>Review CV dengan AI</div>
      </div>
    </div>, size,
  );
}
