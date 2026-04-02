import type { Metadata } from "next";

import { blogConfig } from "@/blog.config";
import { PageHeader } from "@/components/page-header";
import { TaxonomyOverview } from "@/components/taxonomy-overview";
import { getCategoryBuckets } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: blogConfig.theme.labels.categories,
  description: "按主题组织内容，适合横向浏览。",
  pathname: "/categories",
  keywords: ["分类", "taxonomy"]
});

export default function CategoriesPage() {
  const categories = getCategoryBuckets();

  return (
    <div className="stack">
      <PageHeader
        description="按主题组织内容，适合横向浏览。"
        eyebrow="Categories"
        title={blogConfig.theme.labels.categories}
      />
      <TaxonomyOverview emptyText="还没有分类。" hrefBase="/categories" items={categories} />
    </div>
  );
}
