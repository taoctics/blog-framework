import Link from "next/link";

import type { TaxonomyBucket } from "@/lib/blog";

type TaxonomyChipsProps = {
  items: TaxonomyBucket[];
  hrefBase: "/categories" | "/tags" | "/collections";
};

export function TaxonomyChips({ items, hrefBase }: TaxonomyChipsProps) {
  return (
    <div className="chips">
      {items.map((item) => (
        <Link className="chip" href={`${hrefBase}/${item.slug}`} key={item.slug}>
          <span>{item.name}</span>
          <strong>{item.posts.length}</strong>
        </Link>
      ))}
    </div>
  );
}
