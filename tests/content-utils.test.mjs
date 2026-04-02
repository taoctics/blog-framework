import assert from "node:assert/strict";
import test from "node:test";

import {
  compareIsoDatesDescending,
  decodeRouteSegment,
  formatIsoDate,
  parseIsoDateParts,
  slugifySegment,
  toUtcIsoString,
  toUtcRfc822String
} from "../lib/content-utils.ts";

test("parseIsoDateParts accepts valid calendar dates", () => {
  assert.deepEqual(parseIsoDateParts("2026-03-27"), {
    year: 2026,
    month: 3,
    day: 27
  });
});

test("parseIsoDateParts rejects invalid dates", () => {
  assert.equal(parseIsoDateParts("2026-02-30"), null);
  assert.equal(parseIsoDateParts("2026/03/27"), null);
});

test("compareIsoDatesDescending sorts newer dates first", () => {
  const dates = ["2026-03-27", "2026-03-20", "2026-04-01"];

  assert.deepEqual(dates.toSorted(compareIsoDatesDescending), [
    "2026-04-01",
    "2026-03-27",
    "2026-03-20"
  ]);
});

test("formatIsoDate is timezone-stable", () => {
  assert.equal(
    formatIsoDate("2026-03-27", "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }),
    "March 27, 2026"
  );
});

test("UTC conversions preserve the authored calendar day", () => {
  assert.equal(toUtcIsoString("2026-03-27"), "2026-03-27T00:00:00.000Z");
  assert.equal(toUtcRfc822String("2026-03-27"), "Fri, 27 Mar 2026 00:00:00 GMT");
});

test("slugifySegment normalizes labels for taxonomy routes", () => {
  assert.equal(slugifySegment("Café Notes"), "cafe-notes");
  assert.equal(slugifySegment("  写作  "), "写作");
});

test("decodeRouteSegment resolves encoded unicode route params", () => {
  assert.equal(decodeRouteSegment("%E5%90%AF%E5%8A%A8%E6%97%A5%E5%BF%97"), "启动日志");
  assert.equal(decodeRouteSegment("markdown"), "markdown");
});
