import type { Metadata } from "next";

import { blogConfig } from "@/blog.config";
import { toUtcIsoString } from "./content-utils";

const siteUrl = new URL(blogConfig.site.url);

type PageMetadataOptions = {
  title?: string | { absolute: string };
  description: string;
  pathname: string;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  section?: string;
  tags?: string[];
  socialImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function resolveMetadataTitle(title?: string | { absolute: string }) {
  if (!title) {
    return blogConfig.site.title;
  }

  return typeof title === "string" ? title : title.absolute;
}

export function getAbsoluteUrl(pathname: string) {
  return new URL(normalizePathname(pathname), siteUrl).toString();
}

export function getFeedUrl() {
  return getAbsoluteUrl("/feed.xml");
}

export function getDefaultSocialImage() {
  return {
    url: getAbsoluteUrl("/opengraph-image"),
    width: 1200,
    height: 630,
    alt: `${blogConfig.site.title} social preview`
  };
}

export function getPostSocialImage(slug: string, title: string) {
  return {
    url: getAbsoluteUrl(`/posts/${slug}/opengraph-image`),
    width: 1200,
    height: 630,
    alt: `${title} social preview`
  };
}

export function createPageMetadata({
  title,
  description,
  pathname,
  keywords = [],
  type = "website",
  publishedTime,
  section,
  tags = [],
  socialImage = getDefaultSocialImage()
}: PageMetadataOptions): Metadata {
  const absoluteUrl = getAbsoluteUrl(pathname);
  const metadataTitle = resolveMetadataTitle(title);

  return {
    title,
    description,
    keywords: [...blogConfig.site.keywords, ...keywords],
    authors: [{ name: blogConfig.site.author.name }],
    alternates: {
      canonical: absoluteUrl,
      types: {
        "application/rss+xml": getFeedUrl()
      }
    },
    openGraph: {
      type,
      url: absoluteUrl,
      title: metadataTitle,
      description,
      siteName: blogConfig.site.title,
      locale: blogConfig.site.locale,
      images: [socialImage],
      ...(publishedTime ? { publishedTime: toUtcIsoString(publishedTime) } : {}),
      ...(section ? { section } : {}),
      ...(tags.length > 0 ? { tags } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description,
      images: [socialImage.url],
      ...(blogConfig.site.author.handle ? { creator: blogConfig.site.author.handle } : {})
    }
  };
}
