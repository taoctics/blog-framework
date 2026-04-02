import type { BlogConfig } from "./lib/blog-config.ts";

export const blogConfig: BlogConfig = {
  site: {
    title: "Taoctics",
    description: "",
    url: "https://blog.taoctics.com",
    language: "zh-CN",
    locale: "zh-CN",
    keywords: ["blog", "markdown", "writing", "nextjs", "minimal"],
    copyright: "Copyright © 2026 Taoctics",
    icons: {
      icon: "/icons/me.jpeg",
      shortcut: "/icons/me.jpeg",
      apple: "/icons/me.jpeg"
    },
    author: {
      name: "TAOCTICS",
      avatar: {
        src: "/avatars/me.jpeg"
      },
      handle: "@taoctics",
      tagline: "探赜索隐，明道优术",
      //bio: "",
      socialLinks: [
        {
          label: "GitHub",
          href: "https://github.com/taoctics",
          text: "@taoctics"
        },
        {
          label: "X",
          href: "https://x.com/taoctics",
          text: "@taoctics"
        },
        {
          label: "Email",
          href: "mailto:hi@taoctics.com",
          text: "hi@taoctics.com"
        }
      ]
    }
  },
  content: {
    postsDirectory: "../blog-content/posts",
    postsPerPage: 6
  },
  theme: {
    navigation: [
      { label: "分类", href: "/categories" },
      { label: "标签", href: "/tags" },
      { label: "归档", href: "/archive" },
      { label: "合集", href: "/collections" }
    ],
    home: {
      eyebrow: "About",
      featuredTaxonomyLimit: 6
    },
    labels: {
      post: "Post",
      latestPosts: "最新文章",
      categories: "分类",
      tags: "标签",
      collections: "合集",
      archive: "归档",
      tableOfContents: "目录",
      relatedPosts: "相关文章",
      newerPost: "较新文章",
      olderPost: "更早文章",
      archiveFilterPlaceholder: "按标题、摘要、分类、标签或合集筛选归档",
      archiveYear: "年份",
      archiveAllYears: "全部年份",
      archiveEmpty: "没有找到匹配的归档文章。",
      archiveResults: "共 __COUNT__ 篇文章",
      previousPage: "上一页",
      nextPage: "下一页"
    }
  }
};
