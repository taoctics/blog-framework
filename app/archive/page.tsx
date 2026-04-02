import type { Metadata } from "next";

import { blogConfig } from "@/blog.config";
import { ArchivePageClient } from "@/components/archive-page-client";
import { PageHeader } from "@/components/page-header";
import { getPostPreviews } from "@/lib/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: blogConfig.theme.labels.archive,
  description: "按年份筛选并纵向回看全部文章。",
  pathname: "/archive",
  keywords: ["归档", "archive"]
});

export default function ArchivePage() {
  const posts = getPostPreviews();

  return (
    <div className="stack">
      <PageHeader
        description="按年份筛选并纵向回看全部文章。"
        eyebrow="Archive"
        title={blogConfig.theme.labels.archive}
      />
      <ArchivePageClient
        labels={{
          archiveFilterPlaceholder: blogConfig.theme.labels.archiveFilterPlaceholder,
          archiveYear: blogConfig.theme.labels.archiveYear,
          archiveAllYears: blogConfig.theme.labels.archiveAllYears,
          archiveEmpty: blogConfig.theme.labels.archiveEmpty,
          archiveResults: blogConfig.theme.labels.archiveResults
        }}
        locale={blogConfig.site.locale}
        posts={posts}
      />
    </div>
  );
}
