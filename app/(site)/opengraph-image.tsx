import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Turvanotopweb — Pulsa sampai Tagihan, Beres dari Satu Layar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social share image generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #16295a 0%, #0d1731 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2e4c8c 0%, #1f3669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Turvanotopweb</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
            Pulsa sampai tagihan, beres dari satu layar.
          </div>
          <div style={{ fontSize: 28, color: "#c3cfe8", maxWidth: 820 }}>
            {siteConfig.description}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#fa2d1a" }}>
          <span>Pulsa</span>
          <span>·</span>
          <span>Paket Data</span>
          <span>·</span>
          <span>PLN</span>
          <span>·</span>
          <span>Uang Elektronik</span>
          <span>·</span>
          <span>Tagihan</span>
        </div>
      </div>
    ),
    size,
  );
}
