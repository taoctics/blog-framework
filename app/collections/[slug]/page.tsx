import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PaginationNav } from "@/components/pagination-nav";
import { PageHeader } from "@/components/page-header";
import { PostList } from "@/components/post-list";
import { getCollectionBuckets, getCollectionBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getCollectionBuckets().map((collection) => ({
    slug: collection.slug
  }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(decodeRouteSegment(slug));

  return collection
    ? createPageMetadata({
        title: collection.name,
        description: `${collection.name} 合集下共有 ${collection.posts.length} 篇文章。`,
        pathname: `/collections/${collection.slug}`,
        keywords: [collection.name, "合集"]
      })
    : {};
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(decodeRouteSegment(slug));

  if (!collection) {
    notFound();
  }

  const pagination = paginateItems(
    collection.posts,
    1,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref="/collections"
        backLabel={`返回${blogConfig.theme.labels.collections}页`}
        description={`${collection.posts.length} 篇文章`}
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
