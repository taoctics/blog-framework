import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  buildPostAssetUrl,
  isRelativeUrlReference,
  normalizeRelativeAssetPathname,
  resolvePostAssetFile
} from "../lib/post-assets.ts";

test("isRelativeUrlReference only accepts local relative URLs", () => {
  assert.equal(isRelativeUrlReference("./assets/cover.png"), true);
  assert.equal(isRelativeUrlReference("assets/cover.png"), true);
  assert.equal(isRelativeUrlReference("/assets/cover.png"), false);
  assert.equal(isRelativeUrlReference("#section"), false);
  assert.equal(isRelativeUrlReference("mailto:hi@example.com"), false);
  assert.equal(isRelativeUrlReference("https://example.com/cover.png"), false);
});

test("normalizeRelativeAssetPathname keeps only safe in-post paths", () => {
  assert.equal(normalizeRelativeAssetPathname("./assets/cover image.png"), "assets/cover image.png");
  assert.equal(normalizeRelativeAssetPathname("assets/../assets/cover.png"), "assets/cover.png");
  assert.equal(normalizeRelativeAssetPathname("../assets/cover.png"), null);
  assert.equal(normalizeRelativeAssetPathname("/assets/cover.png"), null);
});

test("buildPostAssetUrl preserves query and hash suffixes", () => {
  assert.equal(
    buildPostAssetUrl("启动日志", "./assets/cover image.png?download=1#top"),
    "/posts/%E5%90%AF%E5%8A%A8%E6%97%A5%E5%BF%97/assets/assets/cover%20image.png?download=1#top"
  );
  assert.equal(
    buildPostAssetUrl("hello-world", "./assets/cover.png", "https://blog.example.com"),
    "https://blog.example.com/posts/hello-world/assets/assets/cover.png"
  );
});

test("resolvePostAssetFile confines asset paths to the post directory", () => {
  const sourceDirectory = path.join("/content", "posts", "hello-world");

  assert.equal(
    resolvePostAssetFile(sourceDirectory, "./assets/cover.png"),
    path.join(sourceDirectory, "assets", "cover.png")
  );
  assert.equal(resolvePostAssetFile(sourceDirectory, "../shared/cover.png"), null);
});
