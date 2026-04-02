import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import { PostList } from "@/components/post-list";
import { getCategoryBuckets, getCategoryBySlug } from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { getStaticPageNumbers, paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type CategoryPaginationPageProps = {
  params: Promise<{
    slug: string;
    page: string;
  }>;
};

export function generateStaticParams() {
  return getCategoryBuckets().flatMap((category) =>
    getStaticPageNumbers(category.posts.length, blogConfig.content.postsPerPage)
      .slice(1)
      .map((page) => ({
        slug: category.slug,
        page: String(page)
      }))
  );
}

export async function generateMetadata({ params }: CategoryPaginationPageProps): Promise<Metadata> {
  const { slug, page } = await params;
  const category = getCategoryBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  return category && Number.isInteger(pageNumber) && pageNumber >= 2
    ? createPageMetadata({
        title: `${category.name} · 第 ${pageNumber} 页`,
        description: `${category.name} 分类内容，第 ${pageNumber} 页。`,
        pathname: `/categories/${category.slug}/page/${pageNumber}`,
        keywords: [category.name, "分类"]
      })
    : {};
}

export default async function CategoryPaginationPage({ params }: CategoryPaginationPageProps) {
  const { slug, page } = await params;
  const category = getCategoryBySlug(decodeRouteSegment(slug));
  const pageNumber = Number(page);

  if (!category || !Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = paginateItems(
    category.posts,
    pageNumber,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref={`/categories/${category.slug}`}
        backLabel={`返回${category.name}`}
        description={`${category.posts.length} 篇文章，第 ${pagination.currentPage} / ${pagination.totalPages} 页`}
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
