import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blogConfig } from "@/blog.config";
import { ArticleTableOfContents } from "@/components/article-table-of-contents";
import { PostContentHtml } from "@/components/post-content-html";
import { PostPager } from "@/components/post-pager";
import { PostTaxonomyGroups } from "@/components/post-taxonomy-groups";
import { RelatedPosts } from "@/components/related-posts";
import {
  formatDate,
  getAdjacentPosts,
  getCollectionNavigationForPost,
  getPostBySlug,
  getPostPreviews,
  getRelatedPosts
} from "@/lib/blog";
import { decodeRouteSegment } from "@/lib/content-utils";
import { extractTableOfContents, renderMarkdown } from "@/lib/markdown";
import { createPageMetadata, getPostSocialImage } from "@/lib/seo";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPostPreviews().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(decodeRouteSegment(slug));

  if (!post) {
    return {};
  }

  return createPageMetadata({
    title: post.title,
    description: post.summary,
    pathname: `/posts/${post.slug}`,
    keywords: [...post.categories, ...post.tags, ...post.collections],
    type: "article",
    publishedTime: post.date,
    section: post.categories[0],
    tags: [...post.categories, ...post.tags, ...post.collections],
    socialImage: getPostSocialImage(post.slug, post.title)
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(decodeRouteSegment(slug));

  if (!post) {
    notFound();
  }

  const html = await renderMarkdown(post.content, { postSlug: post.slug });
  const tableOfContents = extractTableOfContents(post.content);
  const collectionGroups = getCollectionNavigationForPost(post.slug);
  const { newerPost, olderPost } = getAdjacentPosts(post.slug);
  const relatedPosts = getRelatedPosts(post.slug);

  return (
    <div className="stack">
      <div className="article-grid">
        <article className="article-shell">
          <header className="article-head">
            <Link className="text-link" href="/">
              返回首页
            </Link>
            <p className="eyebrow">{blogConfig.theme.labels.post}</p>
            <h1 className="article-title">{post.title}</h1>
            {post.summary ? <p className="article-summary">{post.summary}</p> : null}
            <div className="article-meta">
              <span>{formatDate(post.date)}</span>
            </div>
            <PostTaxonomyGroups
              compact
              groups={[
                {
                  label: blogConfig.theme.labels.categories,
                  hrefBase: "/categories",
                  items: post.categories
                },
                {
                  label: blogConfig.theme.labels.tags,
                  hrefBase: "/tags",
                  items: post.tags
                },
                {
                  label: blogConfig.theme.labels.collections,
                  hrefBase: "/collections",
                  items: post.collections
                }
              ]}
            />
          </header>
          <PostContentHtml html={html} />
        </article>

        <ArticleTableOfContents
          collectionGroups={collectionGroups}
          collectionsLabel={blogConfig.theme.labels.collections}
          items={tableOfContents}
          title={blogConfig.theme.labels.tableOfContents}
        />
      </div>

      <PostPager
        newerLabel={blogConfig.theme.labels.newerPost}
        newerPost={newerPost}
        olderLabel={blogConfig.theme.labels.olderPost}
        olderPost={olderPost}
      />
      <RelatedPosts posts={relatedPosts} title={blogConfig.theme.labels.relatedPosts} />
    </div>
  );
}
