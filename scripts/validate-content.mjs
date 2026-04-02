import { getAllPosts, getCategoryBuckets, getCollectionBuckets } from "../lib/blog.ts";

try {
  const posts = getAllPosts();
  const categories = getCategoryBuckets();
  const collections = getCollectionBuckets();

  console.log(`Validated ${posts.length} published posts.`);
  console.log(`Found ${categories.length} categories and ${collections.length} collections.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
