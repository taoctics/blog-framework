import type { MetadataRoute } from "next";

import { blogConfig } from "@/blog.config";
import {
  getCategoryBuckets,
  getCollectionBuckets,
  getPostPreviews,
  getTagBuckets
} from "@/lib/blog";
import { toUtcIsoString } from "@/lib/content-utils";
import { buildPageHref, getStaticPageNumbers } from "@/lib/pagination";
import { getAbsoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPostPreviews();
  const categories = getCategoryBuckets();
  const tags = getTagBuckets();
  const collections = getCollectionBuckets();
  const latestPostDate = posts[0]?.date || new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: getAbsoluteUrl("/archive"),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: getAbsoluteUrl("/categories"),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: getAbsoluteUrl("/tags"),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: getAbsoluteUrl("/collections"),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "weekly",
      priority: 0.7
    }
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: getAbsoluteUrl(`/posts/${post.slug}`),
    lastModified: toUtcIsoString(post.date),
    changeFrequency: "monthly",
    priority: 0.9
  }));

  const paginatedHomePages: MetadataRoute.Sitemap = getStaticPageNumbers(
    posts.length,
    blogConfig.content.postsPerPage
  )
    .slice(1)
    .map((page) => ({
      url: getAbsoluteUrl(buildPageHref("/", page)),
      lastModified: typeof latestPostDate === "string" ? toUtcIsoString(latestPostDate) : latestPostDate,
      changeFrequency: "weekly",
      priority: 0.8
    }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: getAbsoluteUrl(`/categories/${category.slug}`),
    lastModified: category.posts[0]?.date
      ? toUtcIsoString(category.posts[0].date)
      : typeof latestPostDate === "string"
        ? toUtcIsoString(latestPostDate)
        : latestPostDate,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: getAbsoluteUrl(`/tags/${tag.slug}`),
    lastModified: tag.posts[0]?.date
      ? toUtcIsoString(tag.posts[0].date)
      : typeof latestPostDate === "string"
        ? toUtcIsoString(latestPostDate)
        : latestPostDate,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: getAbsoluteUrl(`/collections/${collection.slug}`),
    lastModified: collection.posts[0]?.date
      ? toUtcIsoString(collection.posts[0].date)
      : typeof latestPostDate === "string"
        ? toUtcIsoString(latestPostDate)
        : latestPostDate,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const paginatedCategoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    getStaticPageNumbers(category.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        url: getAbsoluteUrl(buildPageHref(`/categories/${category.slug}`, page)),
        lastModified: category.posts[0]?.date
          ? toUtcIsoString(category.posts[0].date)
          : typeof latestPostDate === "string"
            ? toUtcIsoString(latestPostDate)
            : latestPostDate,
        changeFrequency: "weekly",
        priority: 0.5
      }))
  );

  const paginatedTagPages: MetadataRoute.Sitemap = tags.flatMap((tag) =>
    getStaticPageNumbers(tag.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        url: getAbsoluteUrl(buildPageHref(`/tags/${tag.slug}`, page)),
        lastModified: tag.posts[0]?.date
          ? toUtcIsoString(tag.posts[0].date)
          : typeof latestPostDate === "string"
            ? toUtcIsoString(latestPostDate)
            : latestPostDate,
        changeFrequency: "weekly",
        priority: 0.5
      }))
  );

  const paginatedCollectionPages: MetadataRoute.Sitemap = collections.flatMap((collection) =>
    getStaticPageNumbers(collection.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        url: getAbsoluteUrl(buildPageHref(`/collections/${collection.slug}`, page)),
        lastModified: collection.posts[0]?.date
          ? toUtcIsoString(collection.posts[0].date)
          : typeof latestPostDate === "string"
            ? toUtcIsoString(latestPostDate)
            : latestPostDate,
        changeFrequency: "weekly",
        priority: 0.5
      }))
  );

  return [
    ...staticPages,
    ...postPages,
    ...paginatedHomePages,
    ...categoryPages,
    ...paginatedCategoryPages,
    ...tagPages,
    ...paginatedTagPages,
    ...collectionPages,
    ...paginatedCollectionPages
  ];
}
