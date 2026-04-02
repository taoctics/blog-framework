import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PaginationNav } from "@/components/pagination-nav";
import { PageHeader } from "@/components/page-header";
import { PostList } from "@/components/post-list";
import { getTagBuckets, getTagBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getTagBuckets().map((tag) => ({
    slug: tag.slug
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagBySlug(decodeRouteSegment(slug));

  return tag
    ? createPageMetadata({
        title: tag.name,
        description: `${tag.name} 标签下共有 ${tag.posts.length} 篇文章。`,
        pathname: `/tags/${tag.slug}`,
        keywords: [tag.name, "标签"]
      })
    : {};
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = getTagBySlug(decodeRouteSegment(slug));

  if (!tag) {
    notFound();
  }

  const pagination = paginateItems(
    tag.posts,
    1,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref="/tags"
        backLabel={`返回${blogConfig.theme.labels.tags}页`}
        description={`${tag.posts.length} 篇文章`}
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
