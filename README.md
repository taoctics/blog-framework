# Blog Framework

这个仓库只负责博客框架本身：

- 页面与样式
- Markdown 渲染
- 分类、标签、归档、合集
- RSS、Sitemap、Open Graph
- 内容校验与构建


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

文章创建脚手架已经迁移到 `blog-content` 仓库。`framework` 不再负责生成文章模板或资源目录。

## 本地开发

```bash
npm install
npm run dev
```

## 检查

```bash
npm run check
```

只校验内容时可以单独运行：

```bash
npm run validate:content
```
