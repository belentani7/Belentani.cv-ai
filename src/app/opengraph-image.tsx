import { ImageResponse } from "next/og";

export const alt = "Belentani CV Studio: tu trayectoria, bien contada";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen social pública: sólo marca y propuesta de valor, nunca datos de CV. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 76, color: "#f5f5f5", background: "linear-gradient(135deg,#090a0d 0%,#1b1d26 68%,#303240 100%)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700, letterSpacing: 4 }}>
        BELENTANI <span style={{ color: "#a1a1aa", marginLeft: 20, fontSize: 25, fontWeight: 400 }}>/ CV STUDIO</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Tu trayectoria,</div>
        <div style={{ fontSize: 76, fontWeight: 700, color: "#a1a1aa", lineHeight: 1.05, letterSpacing: -3 }}>bien contada.</div>
        <div style={{ fontSize: 27, marginTop: 24, color: "#d4d4d8" }}>Crea y personaliza tu currículum profesional</div>
      </div>
      <div style={{ width: 130, height: 5, borderRadius: 4, background: "#f5f5f5" }} />
    </div>,
    size,
  );
}
