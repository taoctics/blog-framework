import Link from "next/link";

import { formatDate, type PostPreview } from "@/lib/blog";

type RelatedPostsProps = {
  posts: PostPreview[];
  title: string;
};

export function RelatedPosts({ posts, title }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="stack">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      <div className="related-list">
        {posts.map((post) => (
          <article className="panel related-card" key={post.slug}>
            <header className="stack">
              <span className="meta-row">{formatDate(post.date)}</span>
              <h3>
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
              </h3>
              {post.summary ? <p>{post.summary}</p> : null}
            </header>
          </article>
        ))}
      </div>
    </section>
  );
}
