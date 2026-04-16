import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { blogConfig } from "@/blog.config";
import { SiteShell } from "@/components/site-shell";
import { getDefaultSocialImage, getFeedUrl } from "@/lib/seo";

const socialImage = getDefaultSocialImage();

export const metadata: Metadata = {
  title: {
    default: blogConfig.site.title,
    template: `%s | ${blogConfig.site.title}`
  },
  description: blogConfig.site.description,
  metadataBase: new URL(blogConfig.site.url),
  applicationName: blogConfig.site.title,
  generator: blogConfig.site.title,
  referrer: "origin-when-cross-origin",
  keywords: blogConfig.site.keywords,
  ...(blogConfig.site.icons ? { icons: blogConfig.site.icons } : {}),
  authors: [{ name: blogConfig.site.author.name }],
  creator: blogConfig.site.author.name,
  publisher: blogConfig.site.author.name,
  alternates: {
    canonical: blogConfig.site.url,
    types: {
      "application/rss+xml": getFeedUrl()
    }
  },
  openGraph: {
    type: "website",
    title: blogConfig.site.title,
    description: blogConfig.site.description,
    siteName: blogConfig.site.title,
    locale: blogConfig.site.locale,
    url: blogConfig.site.url,
    images: [socialImage]
  },
  twitter: {
    card: "summary_large_image",
    title: blogConfig.site.title,
    description: blogConfig.site.description,
    images: [socialImage.url],
    ...(blogConfig.site.author.handle ? { creator: blogConfig.site.author.handle } : {})
  }
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  colorScheme: "light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang={blogConfig.site.language}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
