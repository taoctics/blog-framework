import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import { PostList } from "@/components/post-list";
import { getCollectionBuckets, getCollectionBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { getStaticPageNumbers, paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type CollectionPaginationPageProps = {
  params: Promise<{
    slug: string;
    page: string;
  }>;
};

export function generateStaticParams() {
  return getCollectionBuckets().flatMap((collection) =>
    getStaticPageNumbers(collection.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        slug: collection.slug,
        page: String(page)
      }))
  );
}

export async function generateMetadata({
  params
}: CollectionPaginationPageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const collection = getCollectionBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  return collection && Number.isInteger(pageNumber) && pageNumber >= 2
    ? createPageMetadata({
        title: `${collection.name} · 第 ${pageNumber} 页`,
        description: `${collection.name} 合集内容，第 ${pageNumber} 页。`,
        pathname: `/collections/${collection.slug}/page/${pageNumber}`,
        keywords: [collection.name, "合集"]
      })
    : {};
}

export default async function CollectionPaginationPage({
  params
}: CollectionPaginationPageProps) {
  const { slug, page } = await params;
  const collection = getCollectionBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  if (!collection || !Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = paginateItems(
    collection.posts,
    pageNumber,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref={`/collections/${collection.slug}`}
        backLabel={`返回${collection.name}`}
        description={`${collection.posts.length} 篇文章，第 ${pagination.currentPage} / ${pagination.totalPages} 页`}
        eyebrow="Collection"
        title={collection.name}
      />
      <PostList posts={pagination.items} />
      <PaginationNav
        basePath={`/collections/${collection.slug}`}
        currentPage={pagination.currentPage}
        nextLabel={blogConfig.theme.labels.nextPage}
        previousLabel={blogConfig.theme.labels.previousPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
