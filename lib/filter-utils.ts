export type FilterablePost = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  categories: string[];
  tags: string[];
  collections: string[];
};

export type HighlightPart = {
  text: string;
  matched: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function tokenizeFilterQuery(query: string) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

export function matchesFilterQuery(post: FilterablePost, query: string) {
  const normalizedQuery = normalize(query);
  const tokens = tokenizeFilterQuery(query);

  if (!normalizedQuery || tokens.length === 0) {
    return false;
  }

  const haystack = [
    post.title,
    post.summary,
    post.slug,
    ...post.categories,
    ...post.tags,
    ...post.collections
  ]
    .map(normalize)
    .join("\n");

  return tokens.every((token) => haystack.includes(token));
}

export function getHighlightParts(text: string, query: string): HighlightPart[] {
  const tokens = Array.from(new Set(tokenizeFilterQuery(query))).toSorted(
    (left, right) => right.length - left.length
  );

  if (!text || tokens.length === 0) {
    return [{ text, matched: false }];
  }

  const pattern = new RegExp(`(${tokens.map(escapeForRegExp).join("|")})`, "giu");
  const parts = text.split(pattern).filter(Boolean);

  if (parts.length === 0) {
    return [{ text, matched: false }];
  }

  return parts.map((part) => ({
    text: part,
    matched: tokens.some((token) => part.toLocaleLowerCase() === token)
  }));
}
