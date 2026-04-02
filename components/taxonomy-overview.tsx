import Link from "next/link";

import type { TaxonomyBucket } from "@/lib/blog";

type TaxonomyOverviewProps = {
  items: TaxonomyBucket[];
  hrefBase: "/categories" | "/tags" | "/collections";
  emptyText: string;
};

export function TaxonomyOverview({
  items,
  hrefBase,
  emptyText
}: TaxonomyOverviewProps) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <div className="taxonomy-list">
      {items.map((item) => (
        <article className="taxonomy-card" key={item.slug}>
          <header className="section-head">
            <h2>
              <Link href={`${hrefBase}/${item.slug}`}>{item.name}</Link>
            </h2>
            <span className="meta-row">{item.posts.length} 篇</span>
          </header>
          <p>{item.posts.slice(0, 3).map((post) => post.title).join(" / ")}</p>
        </article>
      ))}
    </div>
  );
}
