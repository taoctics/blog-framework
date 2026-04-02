import Link from "next/link";

import { blogConfig } from "@/blog.config";
import { formatDate, type PostPreview } from "@/lib/blog";
import { PostTaxonomyGroups } from "./post-taxonomy-groups";

type PostListProps = {
  posts: PostPreview[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="empty-state">还没有文章。</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => {
        const taxonomyGroups = [
          {
            label: blogConfig.theme.labels.categories,
            hrefBase: "/categories" as const,
            items: post.categories
          },
          {
            label: blogConfig.theme.labels.tags,
            hrefBase: "/tags" as const,
            items: post.tags
          },
          {
            label: blogConfig.theme.labels.collections,
            hrefBase: "/collections" as const,
            items: post.collections
          }
        ];
        const hasTaxonomy = taxonomyGroups.some((group) => group.items.length > 0);

        return (
          <article className="post-card" key={post.slug}>
            <header>
              <div className="meta-row">
                <span>{formatDate(post.date)}</span>
              </div>
              <h3>
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
              </h3>
              {post.summary ? <p>{post.summary}</p> : null}
            </header>
            {hasTaxonomy ? (
              <footer className="post-card-footer">
                <PostTaxonomyGroups compact groups={taxonomyGroups} />
              </footer>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
