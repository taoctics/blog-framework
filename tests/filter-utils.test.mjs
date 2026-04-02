import assert from "node:assert/strict";
import test from "node:test";

import {
  getHighlightParts,
  matchesFilterQuery,
  tokenizeFilterQuery
} from "../lib/filter-utils.ts";

const posts = [
  {
    slug: "math-notes",
    title: "数学公式渲染检查",
    summary: "验证行内公式与块级公式在 Markdown 渲染链路中的表现。",
    date: "2026-03-26",
    categories: ["技术"],
    tags: ["markdown", "数学"],
    collections: ["渲染系统"]
  },
  {
    slug: "series-driven-writing",
    title: "用合集组织长期写作",
    summary: "合集适合承载系列更新，而不是把所有内容都强行归类。",
    date: "2026-03-20",
    categories: ["产品", "写作"],
    tags: ["长期主义", "内容架构"],
    collections: ["启动日志", "内容架构"]
  }
];

test("tokenizeFilterQuery normalizes and splits whitespace", () => {
  assert.deepEqual(tokenizeFilterQuery("  Markdown   数学 "), ["markdown", "数学"]);
});

test("matchesFilterQuery matches across title, summary, slug, and taxonomy", () => {
  assert.equal(matchesFilterQuery(posts[0], "markdown"), true);
  assert.equal(matchesFilterQuery(posts[1], "内容架构"), true);
});

test("matchesFilterQuery requires all tokens to appear somewhere in the post", () => {
  assert.equal(matchesFilterQuery(posts[0], "markdown 数学"), true);
  assert.equal(matchesFilterQuery(posts[0], "markdown 长期主义"), false);
});

test("getHighlightParts marks matched fragments while preserving original text", () => {
  assert.deepEqual(getHighlightParts("Markdown 数学公式", "markdown 公式"), [
    { text: "Markdown", matched: true },
    { text: " 数学", matched: false },
    { text: "公式", matched: true }
  ]);
});
