import fs from "node:fs/promises";
import path from "node:path";

import { getPostBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { isBlockedPostAssetFile, resolvePostAssetFile } from "@/lib/post-assets";

type PostAssetRouteProps = {
  params: Promise<{
    slug: string;
    assetPath: string[];
  }>;
};

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".json", "application/json; charset=utf-8"],
  [".m4a", "audio/mp4"],
  [".mov", "video/quicktime"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wav", "audio/wav"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".zip", "application/zip"]
]);

function notFoundResponse() {
  return new Response("Not Found", {
    status: 404
  });
}

function getContentType(filePath: string) {
  return CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

export async function GET(_request: Request, { params }: PostAssetRouteProps) {
  const { slug, assetPath } = await params;
  const post = getPostBySlug(decodeRouteSegment(slug));

  if (!post) {
    return notFoundResponse();
  }

  const requestedAssetPath = assetPath.map(decodeRouteSegment).join("/");
  const resolvedAssetPath = resolvePostAssetFile(post.sourceDirectory, requestedAssetPath);

  if (!resolvedAssetPath || isBlockedPostAssetFile(resolvedAssetPath)) {
    return notFoundResponse();
  }

  try {
    const [realSourceDirectory, realSourcePath, realAssetPath] = await Promise.all([
      fs.realpath(post.sourceDirectory),
      fs.realpath(post.sourcePath),
      fs.realpath(resolvedAssetPath)
    ]);
    const relativeAssetPath = path.relative(realSourceDirectory, realAssetPath);

    if (
      !relativeAssetPath ||
      relativeAssetPath.startsWith("..") ||
      path.isAbsolute(relativeAssetPath) ||
      realAssetPath === realSourcePath
    ) {
      return notFoundResponse();
    }

    const assetStats = await fs.stat(realAssetPath);

    if (!assetStats.isFile()) {
      return notFoundResponse();
    }

    const body = await fs.readFile(realAssetPath);

    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": getContentType(realAssetPath)
      }
    });
  } catch {
    return notFoundResponse();
  }
}
