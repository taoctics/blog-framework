# Blog Framework

这个仓库只负责博客框架本身：

- 页面与样式
- Markdown 渲染
- 分类、标签、归档、合集
- RSS、Sitemap、Open Graph


## 目录关系

默认配置下，框架会读取：

```text
../blog-content/posts
```

对应配置位于 `blog.config.ts`：

```ts
content: {
  postsDirectory: "../blog-content/posts",
  postsPerPage: 6
}
```

## 本地开发

```bash
npm install
npm run dev
```

## 检查

```bash
npm run check
```
