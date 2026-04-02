import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PaginationNav } from "@/components/pagination-nav";
import { PageHeader } from "@/components/page-header";
import { PostList } from "@/components/post-list";
import { getCategoryBuckets, getCategoryBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getCategoryBuckets().map((category) => ({
    slug: category.slug
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(decodeRouteSegment(slug));

  return category
    ? createPageMetadata({
        title: category.name,
        description: `${category.name} 分类下共有 ${category.posts.length} 篇文章。`,
        pathname: `/categories/${category.slug}`,
        keywords: [category.name, "分类"]
      })
    : {};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(decodeRouteSegment(slug));

  if (!category) {
    notFound();
  }

  const pagination = paginateItems(
    category.posts,
    1,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref="/categories"
        backLabel={`返回${blogConfig.theme.labels.categories}页`}
        description={`${category.posts.length} 篇文章`}
        eyebrow="Category"
        title={category.name}
      />
      <PostList posts={pagination.items} />
      <PaginationNav
        basePath={`/categories/${category.slug}`}
        currentPage={pagination.currentPage}
        nextLabel={blogConfig.theme.labels.nextPage}
        previousLabel={blogConfig.theme.labels.previousPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
