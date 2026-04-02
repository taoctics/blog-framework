import type { TableOfContentsItem } from "@/lib/markdown";

type ArticleTableOfContentsProps = {
  items: TableOfContentsItem[];
  title: string;
};

export function ArticleTableOfContents({ items, title }: ArticleTableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="panel article-sidebar">
      <p className="eyebrow">Sections</p>
      <h2 className="sidebar-title">{title}</h2>
      <nav aria-label={title}>
        <ol className="toc-list">
          {items.map((item) => (
            <li className="toc-item" key={item.id}>
              <a
                className={`toc-link toc-level-${item.level}`}
                href={`#${item.id}`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
