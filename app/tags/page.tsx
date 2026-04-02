import type { Metadata } from "next";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { TaxonomyOverview } from "@/components/taxonomy-overview";
import { getTagBuckets } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: blogConfig.theme.labels.tags,
  description: "用更细的关键词快速定位具体内容。",
  pathname: "/tags",
  keywords: ["标签", "tags"]
});

export default function TagsPage() {
  const tags = getTagBuckets();

  return (
    <div className="stack">
      <PageHeader
        description="用更细的关键词快速定位具体内容。"
        eyebrow="Tags"
        title={blogConfig.theme.labels.tags}
      />
      <TaxonomyOverview emptyText="还没有标签。" hrefBase="/tags" items={tags} />
    </div>
  );
}
