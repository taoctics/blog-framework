import type { Metadata } from "next";
import Link from "next/link";

import { blogConfig } from "@/blog.config";
import { HomeProfile } from "@/components/home-profile";
import { PaginationNav } from "@/components/pagination-nav";
import { PostList } from "@/components/post-list";
import { TaxonomyChips } from "@/components/taxonomy-chips";
import { getCategoryBuckets, getCollectionBuckets, getPostPreviews, getTagBuckets } from "@/lib/blog";
import { paginateItems } from "@/lib/pagination";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: { absolute: blogConfig.site.title },
  description: blogConfig.site.description,
  pathname: "/"
});

export default function HomePage() {
  const posts = getPostPreviews();
  const pagination = paginateItems(posts, 1, blogConfig.content.postsPerPage);
  const categories = getCategoryBuckets().slice(0, blogConfig.theme.home.featuredTaxonomyLimit);
  const tags = getTagBuckets().slice(0, blogConfig.theme.home.featuredTaxonomyLimit);
  const collections = getCollectionBuckets().slice(0, blogConfig.theme.home.featuredTaxonomyLimit);

  if (!pagination) {
    throw new Error("Unable to paginate the home feed.");
  }

  return (
    <div className="stack">
      <HomeProfile author={blogConfig.site.author} eyebrow={blogConfig.theme.home.eyebrow} />

      <section className="stack">
        <div className="section-head">
          <h2>{blogConfig.theme.labels.latestPosts}</h2>
          <Link className="text-link" href="/archive">
            查看全部{blogConfig.theme.labels.archive}
          </Link>
        </div>
        <PostList posts={pagination.items} />
        <PaginationNav
          basePath="/"
          currentPage={pagination.currentPage}
          nextLabel={blogConfig.theme.labels.nextPage}
          previousLabel={blogConfig.theme.labels.previousPage}
          totalPages={pagination.totalPages}
        />
      </section>

      <section className="grid grid-3">
        <div className="taxonomy-card">
          <header className="section-head">
            <h2>{blogConfig.theme.labels.categories}</h2>
            <Link className="text-link" href="/categories">
              全部{blogConfig.theme.labels.categories}
            </Link>
          </header>
          <TaxonomyChips hrefBase="/categories" items={categories} />
        </div>

        <div className="taxonomy-card">
          <header className="section-head">
            <h2>{blogConfig.theme.labels.tags}</h2>
            <Link className="text-link" href="/tags">
              全部{blogConfig.theme.labels.tags}
            </Link>
          </header>
          <TaxonomyChips hrefBase="/tags" items={tags} />
        </div>

        <div className="taxonomy-card">
          <header className="section-head">
            <h2>{blogConfig.theme.labels.collections}</h2>
            <Link className="text-link" href="/collections">
              全部{blogConfig.theme.labels.collections}
            </Link>
          </header>
          <TaxonomyChips hrefBase="/collections" items={collections} />
        </div>
      </section>
    </div>
  );
}
