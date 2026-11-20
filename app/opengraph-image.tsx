import { ImageResponse } from "next/og";
import { profile } from "@/content";

/** Share image (CLAUDE.md §9). Reads only from content/ (CLAUDE.md §7 rule). */
export const alt = `${profile.name}: ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #86C2DC 0%, #F4CFA4 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* a little canopy */}
      <div style={{ position: "absolute", top: 70, right: 120, display: "flex", gap: 6 }}>
        {["#D0402C", "#E6B04E", "#4E9C8F", "#E6B04E", "#D0402C"].map((c, i) => (
          <div
            key={i}
            style={{
              width: 46,
              height: 26,
              borderRadius: 12,
              background: c,
              marginTop: Math.abs(i - 2) * 10,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 900,
          padding: "56px 64px",
          borderRadius: 40,
          background: "#FBF7EE",
          boxShadow: "0 24px 60px rgba(60,50,40,0.25)",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 4, color: "#5E5A63", fontWeight: 700 }}>
          13,000 FT · DOOR OPEN
        </div>
        <div style={{ fontSize: 80, fontWeight: 800, color: "#2B2A30", marginTop: 8 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#1F6F69", marginTop: 8 }}>
          {profile.title}
        </div>
        <div style={{ fontSize: 30, color: "#2B2A30", marginTop: 24, lineHeight: 1.35 }}>
          {profile.pitch}
        </div>
      </div>
    </div>,
    size,
  );
}
