import { ImageResponse } from "next/og";

import { blogConfig } from "@/blog.config";

export const alt = `${blogConfig.site.title} social preview`;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          padding: "56px",
          background:
            "radial-gradient(circle at top left, rgba(141, 92, 63, 0.24), transparent 30%), radial-gradient(circle at top right, rgba(88, 115, 92, 0.18), transparent 24%), linear-gradient(180deg, #f7f4ee 0%, #f1ede5 100%)",
          color: "#1c1c18"
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(25, 30, 20, 0.14)",
            borderRadius: "28px",
            padding: "44px",
            background: "rgba(255, 255, 255, 0.72)"
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#8d5c3f"
            }}
          >
            {blogConfig.site.title}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 920,
              fontFamily: "Georgia, serif",
              fontSize: 82,
              lineHeight: 1.06,
              letterSpacing: "-0.05em"
            }}
          >
            Minimal Markdown Publishing
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 840,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#4f5046"
            }}
          >
            File-based content, categories, archives, collections, and static publishing.
          </div>
        </div>
      </div>
    ),
    size
  );
}
