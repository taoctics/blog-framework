import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { discoverPostSources } from "../lib/post-sources.ts";

test("discoverPostSources supports flat files and directory-based posts", () => {
  const rootDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-post-sources-"));

  try {
    const directoryPostRoot = path.join(rootDirectory, "directory-post");
    const nestedRoot = path.join(rootDirectory, "nested");

    fs.mkdirSync(path.join(directoryPostRoot, "assets"), { recursive: true });
    fs.mkdirSync(nestedRoot, { recursive: true });

    fs.writeFileSync(path.join(directoryPostRoot, "index.md"), "# Directory post");
    fs.writeFileSync(path.join(directoryPostRoot, "assets", "notes.md"), "# Not a post");
    fs.writeFileSync(path.join(nestedRoot, "standalone.md"), "# Standalone post");

    const sources = discoverPostSources(rootDirectory);

    assert.deepEqual(sources, [
      {
        filePath: path.join(directoryPostRoot, "index.md"),
        sourceDirectory: directoryPostRoot,
        fallbackSlug: "directory-post"
      },
      {
        filePath: path.join(nestedRoot, "standalone.md"),
        sourceDirectory: nestedRoot,
        fallbackSlug: "standalone"
      }
    ]);
  } finally {
    fs.rmSync(rootDirectory, { recursive: true, force: true });
  }
});
