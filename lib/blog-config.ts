export type NavigationItem = {
  label: string;
  href: string;
};

export type AuthorLink = {
  label: string;
  href: string;
  text?: string;
};

export type SiteIcons = {
  icon?: string;
  shortcut?: string;
  apple?: string;
};

export type BlogConfig = {
  site: {
    title: string;
    description: string;
    url: string;
    language: string;
    locale: string;
    keywords: string[];
    copyright?: string;
    icons?: SiteIcons;
    author: {
      name: string;
      handle?: string;
      email?: string;
      tagline?: string;
      bio?: string;
      avatar?: {
        src: string;
        alt?: string;
      };
      socialLinks?: AuthorLink[];
    };
  };
  content: {
    postsDirectory: string;
    postsPerPage: number;
  };
  theme: {
    navigation: NavigationItem[];
    home: {
      eyebrow: string;
      featuredTaxonomyLimit: number;
    };
    labels: {
      post: string;
      latestPosts: string;
      categories: string;
      tags: string;
      collections: string;
      archive: string;
      tableOfContents: string;
      relatedPosts: string;
      newerPost: string;
      olderPost: string;
      archiveFilterPlaceholder: string;
      archiveYear: string;
      archiveAllYears: string;
      archiveEmpty: string;
      archiveResults: string;
      previousPage: string;
      nextPage: string;
    };
  };
};
