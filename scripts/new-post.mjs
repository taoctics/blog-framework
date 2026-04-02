import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const templatePath = path.join(cwd, "templates", "post.md");
const { blogConfig } = await import("../blog.config.ts");
const postsDirectory = path.join(cwd, blogConfig.content.postsDirectory);
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const title = args.filter((arg) => arg !== "--dry-run").join(" ").trim();

if (!title) {
  console.error('Usage: npm run new:post -- [--dry-run] "文章标题"');
  process.exit(1);
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const slug = slugify(title);

if (!slug) {
  console.error("Unable to generate a slug from the provided title.");
  process.exit(1);
}

const targetDirectory = path.join(postsDirectory, slug);
const targetPath = path.join(targetDirectory, "index.md");
const assetsDirectory = path.join(targetDirectory, "assets");
const gitkeepPath = path.join(assetsDirectory, ".gitkeep");
const legacyTargetPath = path.join(postsDirectory, `${slug}.md`);
const existingPath = fs.existsSync(targetDirectory)
  ? targetDirectory
  : fs.existsSync(legacyTargetPath)
    ? legacyTargetPath
    : null;

if (existingPath) {
  console.error(`Post already exists: ${path.relative(cwd, existingPath)}`);
  process.exit(1);
}

fs.mkdirSync(postsDirectory, { recursive: true });

const template = fs.readFileSync(templatePath, "utf8");
const content = template
  .replace(/__TITLE__/g, title)
  .replace(/__DATE__/g, formatLocalDate(new Date()))
  .replace(/__SUMMARY__/g, `写一段关于「${title}」的摘要。`)
  .replace(/__TAG__/g, slug);

if (dryRun) {
  console.log(`Would create ${path.relative(cwd, targetPath)}`);
  console.log(`Would create ${path.relative(cwd, gitkeepPath)}`);
  console.log("");
  console.log(content);
  process.exit(0);
}

fs.mkdirSync(assetsDirectory, { recursive: true });
fs.writeFileSync(targetPath, content);
fs.writeFileSync(gitkeepPath, "");

console.log(`Created ${path.relative(cwd, targetPath)}`);
console.log(`Created ${path.relative(cwd, gitkeepPath)}`);
