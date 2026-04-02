import type { Metadata } from "next";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { TaxonomyOverview } from "@/components/taxonomy-overview";
import { getCollectionBuckets } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: blogConfig.theme.labels.collections,
  description: "用来承载专题、系列文章和长期项目。",
  pathname: "/collections",
  keywords: ["合集", "series", "collections"]
});

export default function CollectionsPage() {
  const collections = getCollectionBuckets();

  return (
    <div className="stack">
      <PageHeader
        description="用来承载专题、系列文章和长期项目。"
        eyebrow="Collections"
        title={blogConfig.theme.labels.collections}
      />
      <TaxonomyOverview emptyText="还没有合集。" hrefBase="/collections" items={collections} />
    </div>
  );
}
