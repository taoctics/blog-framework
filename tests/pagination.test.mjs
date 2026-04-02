import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPageHref,
  getPaginationSlots,
  getStaticPageNumbers,
  paginateItems
} from "../lib/pagination.ts";

test("paginateItems returns the requested slice with metadata", () => {
  const pagination = paginateItems([1, 2, 3, 4, 5], 2, 2);

  assert.deepEqual(pagination, {
    items: [3, 4],
    currentPage: 2,
    totalItems: 5,
    totalPages: 3,
    pageSize: 2
  });
});

test("buildPageHref keeps the first page canonical", () => {
  assert.equal(buildPageHref("/", 1), "/");
  assert.equal(buildPageHref("/", 3), "/page/3");
  assert.equal(buildPageHref("/tags/markdown", 1), "/tags/markdown");
  assert.equal(buildPageHref("/tags/markdown", 2), "/tags/markdown/page/2");
});

test("getStaticPageNumbers enumerates every page", () => {
  assert.deepEqual(getStaticPageNumbers(10, 4), [1, 2, 3]);
});

test("getPaginationSlots inserts ellipses for long ranges", () => {
  assert.deepEqual(getPaginationSlots(5, 10), [1, "ellipsis-left", 4, 5, 6, "ellipsis-right", 10]);
});
