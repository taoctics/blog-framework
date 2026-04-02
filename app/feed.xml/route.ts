import { blogConfig } from "@/blog.config";
import { getAllPosts } from "@/lib/blog";
import { toUtcRfc822String } from "@/lib/content-utils";
import { renderMarkdown } from "@/lib/markdown";
import { getAbsoluteUrl, getFeedUrl } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toCdata(value: string) {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

export async function GET() {
  const posts = getAllPosts();
  const latestDate = posts[0]?.date || new Date();
  const items = await Promise.all(
    posts.map(async (post) => {
      const url = getAbsoluteUrl(`/posts/${post.slug}`);
      const html = await renderMarkdown(post.content, {
        postSlug: post.slug,
        siteUrl: blogConfig.site.url
      });
      const taxonomyNodes = Array.from(
        new Set([...post.categories, ...post.tags, ...post.collections])
      ).map((category) => {
        return `<category>${escapeXml(category)}</category>`;
      });

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid>${url}</guid>`,
        `<pubDate>${toUtcRfc822String(post.date)}</pubDate>`,
        `<description>${escapeXml(post.summary)}</description>`,
        ...taxonomyNodes,
        `<content:encoded><![CDATA[${toCdata(html)}]]></content:encoded>`,
        "</item>"
      ].join("");
    })
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    "<channel>",
    `<title>${escapeXml(blogConfig.site.title)}</title>`,
    `<link>${blogConfig.site.url}</link>`,
    `<description>${escapeXml(blogConfig.site.description)}</description>`,
    `<language>${blogConfig.site.language}</language>`,
    `<managingEditor>${escapeXml(blogConfig.site.author.email || blogConfig.site.author.name)}</managingEditor>`,
    `<lastBuildDate>${typeof latestDate === "string" ? toUtcRfc822String(latestDate) : latestDate.toUTCString()}</lastBuildDate>`,
    `<atom:link href="${getFeedUrl()}" rel="self" type="application/rss+xml" />`,
    ...items,
    "</channel>",
    "</rss>"
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate"
    }
  });
}
