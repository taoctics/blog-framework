import path from "node:path";

const URL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const BLOCKED_SOURCE_EXTENSIONS = new Set([".md", ".mdx", ".markdown"]);

function splitUrlSuffix(value: string) {
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const suffixIndex = [queryIndex, hashIndex].filter((index) => index >= 0).reduce((min, index) => {
    return Math.min(min, index);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(suffixIndex)) {
    return {
      pathname: value,
      suffix: ""
    };
  }

  return {
    pathname: value.slice(0, suffixIndex),
    suffix: value.slice(suffixIndex)
  };
}

function encodeUrlPath(pathname: string) {
  return pathname
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

export function isRelativeUrlReference(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return false;
  }

  return !URL_SCHEME_PATTERN.test(trimmed);
}

export function normalizeRelativeAssetPathname(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = path.posix.normalize(trimmed.replace(/\\/g, "/"));

  if (
    !normalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.startsWith("/")
  ) {
    return null;
  }

  return normalized;
}

export function buildPostAssetUrl(slug: string, reference: string, siteUrl?: string) {
  if (!isRelativeUrlReference(reference)) {
    return null;
  }

  const { pathname, suffix } = splitUrlSuffix(reference.trim());
  const normalizedPathname = normalizeRelativeAssetPathname(pathname);

  if (!normalizedPathname) {
    return null;
  }

  const routePath = `/posts/${encodeURIComponent(slug)}/assets/${encodeUrlPath(normalizedPathname)}`;

  if (!siteUrl) {
    return `${routePath}${suffix}`;
  }

  return `${new URL(routePath, siteUrl).toString()}${suffix}`;
}

export function resolvePostAssetFile(sourceDirectory: string, assetPath: string) {
  const normalizedPathname = normalizeRelativeAssetPathname(assetPath);

  if (!normalizedPathname) {
    return null;
  }

  const resolvedPath = path.resolve(sourceDirectory, ...normalizedPathname.split("/"));
  const relativePath = path.relative(sourceDirectory, resolvedPath);

  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return resolvedPath;
}

export function isBlockedPostAssetFile(filePath: string) {
  return BLOCKED_SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
