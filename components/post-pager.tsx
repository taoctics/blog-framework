import Link from "next/link";

import { formatDate, type PostPreview } from "@/lib/blog";

type PostPagerProps = {
  newerPost: PostPreview | null;
  olderPost: PostPreview | null;
  newerLabel: string;
  olderLabel: string;
};

export function PostPager({ newerPost, olderPost, newerLabel, olderLabel }: PostPagerProps) {
  if (!newerPost && !olderPost) {
    return null;
  }

  return (
    <section className="post-nav">
      {newerPost ? (
        <Link className="panel post-nav-card" href={`/posts/${newerPost.slug}`}>
          <span className="nav-label">{newerLabel}</span>
          <strong>{newerPost.title}</strong>
          <span className="meta-row">{formatDate(newerPost.date)}</span>
        </Link>
      ) : (
        <div className="panel post-nav-card post-nav-card-empty" />
      )}

      {olderPost ? (
        <Link className="panel post-nav-card" href={`/posts/${olderPost.slug}`}>
          <span className="nav-label">{olderLabel}</span>
          <strong>{olderPost.title}</strong>
          <span className="meta-row">{formatDate(olderPost.date)}</span>
        </Link>
      ) : (
        <div className="panel post-nav-card post-nav-card-empty" />
      )}
    </section>
  );
}
