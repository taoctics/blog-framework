import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { cache } from "react";

import { blogConfig } from "../blog.config.ts";
import {
  compareIsoDatesDescending,
  formatIsoDate,
  formatMonthLabel,
  parseIsoDateParts,
  slugifySegment
} from "./content-utils.ts";
import { discoverPostSources, type PostSource } from "./post-sources.ts";

const postsDirectory = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  blogConfig.content.postsDirectory
);

type RawFrontmatter = {
  slug?: string;
  title?: string;
  date?: string | Date;
  summary?: string;
  categories?: string[] | string;
  tags?: string[] | string;
  collections?: string[] | string;
  draft?: boolean;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  categories: string[];
  tags: string[];
  collections: string[];
  draft: boolean;
  content: string;
  sourcePath: string;
  sourceDirectory: string;
};

export type PostPreview = Omit<Post, "content" | "sourcePath" | "sourceDirectory">;

export type TaxonomyBucket = {
  name: string;
  slug: string;
  posts: PostPreview[];
};

export type ArchiveMonth = {
  key: string;
  label: string;
  posts: PostPreview[];
};

export type ArchiveYear = {
  year: string;
  months: ArchiveMonth[];
};

function ensurePostsDirectory() {
  return discoverPostSources(postsDirectory);
}

function toArray(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function sortPosts(posts: PostPreview[]) {
  return posts.toSorted((left, right) => compareIsoDatesDescending(left.date, right.date));
}

function invalidFrontmatter(filePath: string, message: string): never {
  throw new Error(`[${path.relative(process.cwd(), filePath)}] ${message}`);
}

function formatYamlDate(value: Date) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(filePath: string, value: string | Date | undefined) {
  if (!value) {
    invalidFrontmatter(filePath, 'Missing required "date" field.');
  }

  if (value instanceof Date) {
    return formatYamlDate(value);
  }

  if (typeof value !== "string" || !parseIsoDateParts(value)) {
    invalidFrontmatter(
      filePath,
      'Expected "date" to use the YYYY-MM-DD format and be a valid calendar date.'
    );
  }

  return value;
}

function normalizeTitle(filePath: string, value: string | undefined, fallback: string) {
  if (value !== undefined && typeof value !== "string") {
    invalidFrontmatter(filePath, 'Expected "title" to be a string.');
  }

  if (!value) {
    invalidFrontmatter(filePath, 'Missing required "title" field.');
  }

  return value.trim() || fallback;
}

function normalizeSlug(filePath: string, value: string | undefined, fallback: string) {
  if (value !== undefined && typeof value !== "string") {
    invalidFrontmatter(filePath, 'Expected "slug" to be a string.');
  }

  const slug = value?.trim() || fallback;

  if (!slug) {
    invalidFrontmatter(filePath, 'Missing required "slug" field.');
  }

  if (slug.includes("/")) {
    invalidFrontmatter(filePath, 'Expected "slug" to not contain "/".');
  }

  return slug;
}

function normalizeStringList(
  filePath: string,
  field: "categories" | "tags" | "collections",
  value: string[] | string | undefined
) {
  const list = toArray(value);

  if (!list.every((item) => typeof item === "string")) {
    invalidFrontmatter(filePath, `Expected "${field}" to be a string or string array.`);
  }

  return list.map((item) => item.trim()).filter(Boolean);
}

function normalizePost(sourceFile: PostSource): Post {
  const source = fs.readFileSync(sourceFile.filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as RawFrontmatter;
  const fileSlug = sourceFile.fallbackSlug;

  if (frontmatter.summary !== undefined && typeof frontmatter.summary !== "string") {
    invalidFrontmatter(sourceFile.filePath, 'Expected "summary" to be a string.');
  }

  if (frontmatter.draft !== undefined && typeof frontmatter.draft !== "boolean") {
    invalidFrontmatter(sourceFile.filePath, 'Expected "draft" to be a boolean.');
  }

  const slug = normalizeSlug(sourceFile.filePath, frontmatter.slug, fileSlug);

  return {
    slug,
    title: normalizeTitle(sourceFile.filePath, frontmatter.title, slug),
    date: normalizeDate(sourceFile.filePath, frontmatter.date),
    summary: frontmatter.summary?.trim() || "",
    categories: normalizeStringList(sourceFile.filePath, "categories", frontmatter.categories),
    tags: normalizeStringList(sourceFile.filePath, "tags", frontmatter.tags),
    collections: normalizeStringList(
      sourceFile.filePath,
      "collections",
      frontmatter.collections
    ),
    draft: Boolean(frontmatter.draft),
    content,
    sourcePath: sourceFile.filePath,
    sourceDirectory: sourceFile.sourceDirectory
  };
}

function toPreview(post: Post): PostPreview {
  const { content: _, sourcePath: __, sourceDirectory: ___, ...preview } = post;
  return preview;
}

function validateUniquePostSlugs(posts: Post[]) {
  const seen = new Map<string, string>();

  for (const post of posts) {
    const existingTitle = seen.get(post.slug);

    if (existingTitle) {
      throw new Error(`Duplicate post slug "${post.slug}" detected for "${existingTitle}" and "${post.title}".`);
    }

    seen.set(post.slug, post.title);
  }
}

export const getAllPosts = cache(() => {
  const posts = ensurePostsDirectory().map(normalizePost);

  validateUniquePostSlugs(posts);

  return posts
    .filter((post) => !post.draft)
    .toSorted((left, right) => compareIsoDatesDescending(left.date, right.date));
});

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug) || null;
}

function groupTaxonomy(
  posts: PostPreview[],
  field: "categories" | "tags" | "collections"
): TaxonomyBucket[] {
  const buckets = new Map<string, PostPreview[]>();

  for (const post of posts) {
    for (const item of post[field]) {
      const bucket = buckets.get(item) || [];
      bucket.push(post);
      buckets.set(item, bucket);
    }
  }

  const taxonomyBuckets = Array.from(buckets.entries()).map(([name, groupedPosts]) => ({
    name,
    slug: slugifySegment(name),
    posts: sortPosts(groupedPosts)
  }));

  const seen = new Map<string, string>();

  for (const bucket of taxonomyBuckets) {
    if (!bucket.slug) {
      throw new Error(`Unable to derive a route slug for ${field.slice(0, -1)} "${bucket.name}".`);
    }

    const existingName = seen.get(bucket.slug);

    if (existingName && existingName !== bucket.name) {
      throw new Error(
        `Conflicting ${field} route slug "${bucket.slug}" generated from "${existingName}" and "${bucket.name}".`
      );
    }

    seen.set(bucket.slug, bucket.name);
  }

  return taxonomyBuckets.toSorted(
    (left, right) => right.posts.length - left.posts.length || left.name.localeCompare(right.name)
  );
}

export const getPostPreviews = cache(() => getAllPosts().map(toPreview));

export const getCategoryBuckets = cache(() => groupTaxonomy(getPostPreviews(), "categories"));

export const getTagBuckets = cache(() => groupTaxonomy(getPostPreviews(), "tags"));

export const getCollectionBuckets = cache(() => groupTaxonomy(getPostPreviews(), "collections"));

export function getCategoryBySlug(slug: string) {
  return getCategoryBuckets().find((bucket) => bucket.slug === slug) || null;
}

export function getCollectionBySlug(slug: string) {
  return getCollectionBuckets().find((bucket) => bucket.slug === slug) || null;
}

export function getTagBySlug(slug: string) {
  return getTagBuckets().find((bucket) => bucket.slug === slug) || null;
}

function countSharedItems(left: string[], right: string[]) {
  const leftSet = new Set(left);
  let count = 0;

  for (const item of right) {
    if (leftSet.has(item)) {
      count += 1;
    }
  }

  return count;
}

export function getAdjacentPosts(slug: string) {
  const posts = getPostPreviews();
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    return {
      newerPost: null,
      olderPost: null
    };
  }

  return {
    newerPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    olderPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
  };
}

export function getRelatedPosts(slug: string, limit = 3) {
  const post = getPostBySlug(slug);

  if (!post) {
    return [];
  }

  return getPostPreviews()
    .filter((candidate) => candidate.slug !== slug)
    .map((candidate) => ({
      post: candidate,
      score:
        countSharedItems(post.tags, candidate.tags) * 5 +
        countSharedItems(post.categories, candidate.categories) * 3 +
        countSharedItems(post.collections, candidate.collections) * 2
    }))
    .filter((candidate) => candidate.score > 0)
    .toSorted(
      (left, right) =>
        right.score - left.score || compareIsoDatesDescending(left.post.date, right.post.date)
    )
    .slice(0, limit)
    .map((candidate) => candidate.post);
}

export const getArchiveGroups = cache((): ArchiveYear[] => {
  const yearMap = new Map<string, Map<string, PostPreview[]>>();

  for (const post of getPostPreviews()) {
    const parts = parseIsoDateParts(post.date);

    if (!parts) {
      throw new Error(`Invalid archive date: ${post.date}`);
    }

    const year = String(parts.year);
    const monthKey = `${year}-${String(parts.month).padStart(2, "0")}`;
    const yearBucket = yearMap.get(year) || new Map<string, PostPreview[]>();
    const monthBucket = yearBucket.get(monthKey) || [];

    monthBucket.push(post);
    yearBucket.set(monthKey, monthBucket);
    yearMap.set(year, yearBucket);
  }

  return Array.from(yearMap.entries())
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries())
        .map(([key, posts]) => ({
          key,
          label: formatMonthLabel(Number(year), Number(key.split("-")[1]), blogConfig.site.locale),
          posts: sortPosts(posts)
        }))
        .toSorted((left, right) => right.key.localeCompare(left.key))
    }))
    .toSorted((left, right) => right.year.localeCompare(left.year));
});

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return formatIsoDate(date, blogConfig.site.locale, options);
}
