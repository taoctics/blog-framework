import fs from "node:fs";
import path from "node:path";

export type PostSource = {
  filePath: string;
  sourceDirectory: string;
  fallbackSlug: string;
};

function walkPostSources(directory: string, allowDirectoryPost: boolean): PostSource[] {
  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .toSorted((left, right) => left.name.localeCompare(right.name));

  if (allowDirectoryPost && entries.some((entry) => entry.isFile() && entry.name === "index.md")) {
    return [
      {
        filePath: path.join(directory, "index.md"),
        sourceDirectory: directory,
        fallbackSlug: path.basename(directory)
      }
    ];
  }

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkPostSources(fullPath, true);
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return [
        {
          filePath: fullPath,
          sourceDirectory: path.dirname(fullPath),
          fallbackSlug: path.basename(fullPath, ".md")
        }
      ];
    }

    return [];
  });
}

export function discoverPostSources(rootDirectory: string) {
  if (!fs.existsSync(rootDirectory)) {
    return [];
  }

  return walkPostSources(rootDirectory, false);
}
