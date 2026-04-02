import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { slugifySegment } from "./content-utils.ts";
import { buildPostAssetUrl } from "./post-assets.ts";

type MarkdownNode = {
  type?: string;
  value?: string;
  depth?: number;
  tagName?: string;
  children?: MarkdownNode[];
  properties?: Record<string, unknown>;
};

export type TableOfContentsItem = {
  id: string;
  text: string;
  level: number;
};

export type RenderMarkdownOptions = {
  postSlug?: string;
  siteUrl?: string;
};

function createUniqueHeadingIdFactory() {
  const seen = new Map<string, number>();

  return (text: string) => {
    const normalized = slugifySegment(text) || "section";
    const currentCount = seen.get(normalized) || 0;

    seen.set(normalized, currentCount + 1);

    return currentCount === 0 ? normalized : `${normalized}-${currentCount + 1}`;
  };
}

function collectMarkdownText(node: MarkdownNode | undefined): string {
  if (!node) {
    return "";
  }

  if (
    node.type === "text" ||
    node.type === "inlineCode" ||
    node.type === "inlineMath" ||
    node.type === "code"
  ) {
    return node.value || "";
  }

  return (node.children || []).map(collectMarkdownText).join("");
}

function collectElementText(node: MarkdownNode | undefined): string {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.value || "";
  }

  return (node.children || []).map(collectElementText).join("");
}

function visit(node: MarkdownNode | undefined, callback: (currentNode: MarkdownNode) => void) {
  if (!node) {
    return;
  }

  callback(node);

  for (const child of node.children || []) {
    visit(child, callback);
  }
}

function rehypeHeadingIds() {
  return (tree: MarkdownNode) => {
    const createHeadingId = createUniqueHeadingIdFactory();

    visit(tree, (node) => {
      if (!node.tagName || !/^h[1-6]$/.test(node.tagName)) {
        return;
      }

      const headingText = collectElementText(node).trim();

      if (!headingText) {
        return;
      }

      node.properties = {
        ...node.properties,
        id: createHeadingId(headingText)
      };
    });
  };
}

function rehypePostAssetUrls(options: RenderMarkdownOptions) {
  return (tree: MarkdownNode) => {
    const { postSlug, siteUrl } = options;

    if (!postSlug) {
      return;
    }

    visit(tree, (node) => {
      if (!node.tagName) {
        return;
      }

      const propertyName =
        node.tagName === "a"
          ? "href"
          : node.tagName === "img" ||
              node.tagName === "audio" ||
              node.tagName === "video" ||
              node.tagName === "source"
            ? "src"
            : null;

      if (!propertyName) {
        return;
      }

      const currentValue = node.properties?.[propertyName];

      if (typeof currentValue !== "string") {
        return;
      }

      const rewrittenValue = buildPostAssetUrl(postSlug, currentValue, siteUrl);

      if (!rewrittenValue) {
        return;
      }

      node.properties = {
        ...node.properties,
        [propertyName]: rewrittenValue
      };
    });
  };
}

export function extractTableOfContents(
  markdown: string,
  options: {
    minLevel?: number;
    maxLevel?: number;
  } = {}
) {
  const { minLevel = 2, maxLevel = 3 } = options;
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown) as MarkdownNode;
  const createHeadingId = createUniqueHeadingIdFactory();
  const items: TableOfContentsItem[] = [];

  visit(tree, (node) => {
    if (node.type !== "heading" || typeof node.depth !== "number") {
      return;
    }

    const text = collectMarkdownText(node).trim();

    if (!text) {
      return;
    }

    const id = createHeadingId(text);

    if (node.depth >= minLevel && node.depth <= maxLevel) {
      items.push({
        id,
        text,
        level: node.depth
      });
    }
  });

  return items;
}

export async function renderMarkdown(markdown: string, options: RenderMarkdownOptions = {}) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHeadingIds)
    .use(rehypePostAssetUrls, options)
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
