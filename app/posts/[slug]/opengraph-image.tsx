import { ImageResponse } from "next/og";

import { blogConfig } from "@/blog.config";
import { getPostBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type PostOpenGraphImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostOpenGraphImage({ params }: PostOpenGraphImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(decodeRouteSegment(slug));
  const title = post?.title || blogConfig.site.title;
  const summary = post?.summary || blogConfig.site.description;
  const taxonomy = post ? [...post.tags, ...post.categories, ...post.collections].slice(0, 3) : [];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          padding: "56px",
          background:
            "radial-gradient(circle at top left, rgba(141, 92, 63, 0.24), transparent 30%), radial-gradient(circle at bottom right, rgba(88, 115, 92, 0.18), transparent 24%), linear-gradient(180deg, #f7f4ee 0%, #f1ede5 100%)",
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
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24
            }}
          >
            <span
              style={{
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#8d5c3f"
              }}
            >
              {blogConfig.site.title}
            </span>
            {taxonomy.length > 0 ? (
              <span
                style={{
                  color: "#5f5e54"
                }}
              >
                {taxonomy.join(" · ")}
              </span>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 940,
              fontFamily: "Georgia, serif",
              fontSize: 72,
              lineHeight: 1.06,
              letterSpacing: "-0.05em"
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 860,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#4f5046"
            }}
          >
            {summary}
          </div>
        </div>
      </div>
    ),
    size
  );
}
