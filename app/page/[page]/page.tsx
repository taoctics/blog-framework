import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import { PostList } from "@/components/post-list";
import { getPostPreviews } from "@/lib/blog";
import { getStaticPageNumbers, paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

type HomePaginationPageProps = {
  params: Promise<{
    page: string;
  }>;
};

export function generateStaticParams() {
  const pageNumbers = getStaticPageNumbers(
    getPostPreviews().length,
    blogConfig.content.postsPerPage
  );

  return pageNumbers.slice(1).map((page) => ({
    page: String(page)
  }));
}

export async function generateMetadata({ params }: HomePaginationPageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    return {};
  }

  return createPageMetadata({
    title: `${blogConfig.theme.labels.latestPosts} · 第 ${pageNumber} 页`,
    description: `最新文章列表，第 ${pageNumber} 页。`,
    pathname: `/page/${pageNumber}`
  });
}

export default async function HomePaginationPage({ params }: HomePaginationPageProps) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = paginateItems(
    getPostPreviews(),
    pageNumber,
    blogConfig.content.postsPerPage
  );

  if (!pagination) {
    notFound();
  }

  return (
    <div className="stack">
      <PageHeader
        backHref="/"
        backLabel={`返回首页`}
        description={`最新文章，第 ${pagination.currentPage} / ${pagination.totalPages} 页。`}
        eyebrow="Archive"
        title={blogConfig.theme.labels.latestPosts}
      />
      <PostList posts={pagination.items} />
      <PaginationNav
        basePath="/"
        currentPage={pagination.currentPage}
        nextLabel={blogConfig.theme.labels.nextPage}
        previousLabel={blogConfig.theme.labels.previousPage}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
