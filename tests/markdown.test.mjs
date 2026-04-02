import assert from "node:assert/strict";
import test from "node:test";

import { extractTableOfContents, renderMarkdown } from "../lib/markdown.ts";

const markdownSample = `
## Start Here

### Deep Dive

## Start Here
`;

test("extractTableOfContents generates stable unique anchor ids", () => {
  assert.deepEqual(extractTableOfContents(markdownSample), [
    { id: "start-here", text: "Start Here", level: 2 },
    { id: "deep-dive", text: "Deep Dive", level: 3 },
    { id: "start-here-2", text: "Start Here", level: 2 }
  ]);
});

test("renderMarkdown injects heading ids for anchor navigation", async () => {
  const html = await renderMarkdown(markdownSample);

  assert.match(html, /<h2 id="start-here">Start Here<\/h2>/);
  assert.match(html, /<h3 id="deep-dive">Deep Dive<\/h3>/);
  assert.match(html, /<h2 id="start-here-2">Start Here<\/h2>/);
});

test("renderMarkdown rewrites relative post asset URLs", async () => {
  const html = await renderMarkdown(
    `
![封面](<./assets/cover image.png>)

[附件](./assets/appendix.pdf#download)
`,
    { postSlug: "启动日志" }
  );

  assert.match(
    html,
    /<img src="\/posts\/%E5%90%AF%E5%8A%A8%E6%97%A5%E5%BF%97\/assets\/assets\/cover%20image\.png" alt="封面">/
  );
  assert.match(
    html,
    /<a href="\/posts\/%E5%90%AF%E5%8A%A8%E6%97%A5%E5%BF%97\/assets\/assets\/appendix\.pdf#download">附件<\/a>/
  );
});
