import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import { PostList } from "@/components/post-list";
import { getTagBuckets, getTagBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { getStaticPageNumbers, paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type TagPaginationPageProps = {
  params: Promise<{
    slug: string;
    page: string;
  }>;
};

export function generateStaticParams() {
  return getTagBuckets().flatMap((tag) =>
    getStaticPageNumbers(tag.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        slug: tag.slug,
        page: String(page)
      }))
  );
}

export async function generateMetadata({ params }: TagPaginationPageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const tag = getTagBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  return tag && Number.isInteger(pageNumber) && pageNumber >= 2
    ? createPageMetadata({
        title: `${tag.name} · 第 ${pageNumber} 页`,
        description: `${tag.name} 标签内容，第 ${pageNumber} 页。`,
        pathname: `/tags/${tag.slug}/page/${pageNumber}`,
        keywords: [tag.name, "标签"]
      })
    : {};
}

export default async function TagPaginationPage({ params }: TagPaginationPageProps) {
  const { slug, page } = await params;
  const tag = getTagBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  if (!tag || !Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = paginateItems(
    tag.posts,
    pageNumber,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref={`/tags/${tag.slug}`}
        backLabel={`返回${tag.name}`}
        description={`${tag.posts.length} 篇文章，第 ${pagination.currentPage} / ${pagination.totalPages} 页`}
        eyebrow="Tag"
        title={tag.name}
      />
      <PostList posts={pagination.items} />
      <PaginationNav
        basePath={`/tags/${tag.slug}`}
        currentPage={pagination.currentPage}
        nextLabel={blogConfig.theme.labels.nextPage}
        previousLabel={blogConfig.theme.labels.previousPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
