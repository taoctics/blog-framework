import assert from "node:assert/strict";
import test from "node:test";

import { sortPostsForCollection } from "../lib/blog.ts";

test("sortPostsForCollection prefers collectionOrder before fallback date sorting", () => {
  const posts = [
    {
      slug: "late-with-order",
      title: "Late With Order",
      date: "2026-04-12",
      summary: "",
      categories: [],
      tags: [],
      collections: ["Series"],
      collectionOrder: 3,
      draft: false
    },
    {
      slug: "early-with-order",
      title: "Early With Order",
      date: "2026-04-01",
      summary: "",
      categories: [],
      tags: [],
      collections: ["Series"],
      collectionOrder: 1,
      draft: false
    },
    {
      slug: "no-order-newer",
      title: "No Order Newer",
      date: "2026-04-11",
      summary: "",
      categories: [],
      tags: [],
      collections: ["Series"],
      collectionOrder: null,
      draft: false
    },
    {
      slug: "no-order-older",
      title: "No Order Older",
      date: "2026-03-20",
      summary: "",
      categories: [],
      tags: [],
      collections: ["Series"],
      collectionOrder: null,
      draft: false
    }
  ];

  assert.deepEqual(
    sortPostsForCollection(posts).map((post) => post.slug),
    ["early-with-order", "late-with-order", "no-order-newer", "no-order-older"]
  );
});
