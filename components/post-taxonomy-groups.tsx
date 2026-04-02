import Link from "next/link";
import type { ReactNode } from "react";

import { slugifySegment } from "@/lib/content-utils";

type TaxonomyBase = "/categories" | "/tags" | "/collections";

type TaxonomyGroup = {
  label: string;
  hrefBase: TaxonomyBase;
  items: string[];
};

type PostTaxonomyGroupsProps = {
  groups: TaxonomyGroup[];
  compact?: boolean;
  renderItem?: (item: string) => ReactNode;
};

export function PostTaxonomyGroups({
  groups,
  compact = false,
  renderItem
}: PostTaxonomyGroupsProps) {
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className={`post-taxonomy-groups${compact ? " post-taxonomy-groups-compact" : ""}`}>
      {visibleGroups.map((group) => (
        <div className="post-taxonomy-group" key={`${group.hrefBase}-${group.label}`}>
          <span className="taxonomy-group-label">{group.label}</span>
          <div className="taxonomy-inline-links">
            {group.items.map((item) => (
              <Link
                className="taxonomy-inline-link"
                href={`${group.hrefBase}/${slugifySegment(item)}`}
                key={`${group.hrefBase}-${item}`}
              >
                {renderItem ? renderItem(item) : item}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
