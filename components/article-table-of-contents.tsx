"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { CollectionNavigationGroup } from "@/lib/blog";
import type { TableOfContentsItem } from "@/lib/markdown";

type ArticleTableOfContentsProps = {
  items: TableOfContentsItem[];
  title: string;
  collectionGroups?: CollectionNavigationGroup[];
  collectionsLabel?: string;
};

function getActiveHeadingId(items: TableOfContentsItem[]) {
  const headings = items
    .map((item) => document.getElementById(item.id))
    .filter((heading): heading is HTMLElement => heading instanceof HTMLElement);

  if (headings.length === 0) {
    return null;
  }

  let activeId = headings[0].id;
  let foundScrolledHeading = false;

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= 160) {
      activeId = heading.id;
      foundScrolledHeading = true;
    } else {
      break;
    }
  }

  const currentHash = window.location.hash.slice(1);

  if (!foundScrolledHeading && currentHash && headings.some((heading) => heading.id === currentHash)) {
    return currentHash;
  }

  return activeId;
}

export function ArticleTableOfContents({
  items,
  title,
  collectionGroups = [],
  collectionsLabel = "Collections"
}: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setActiveId(null);
      return;
    }

    let frame = 0;

    const updateActiveId = () => {
      frame = 0;
      setActiveId(getActiveHeadingId(items));
    };

    const scheduleUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(updateActiveId);
    };

    updateActiveId();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("hashchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  if (items.length === 0 && collectionGroups.length === 0) {
    return null;
  }

  return (
    <div className="article-sidebar-stack">
      {items.length > 0 ? (
        <aside className="panel article-sidebar-panel">
          <p className="eyebrow">Sections</p>
          <h2 className="sidebar-title">{title}</h2>
          <nav aria-label={title}>
            <ol className="toc-list">
              {items.map((item) => (
                <li className="toc-item" key={item.id}>
                  <a
                    className={`toc-link toc-level-${item.level}${activeId === item.id ? " toc-link-active" : ""}`}
                    href={`#${item.id}`}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      ) : null}

      {collectionGroups.length > 0 ? (
        <aside className="panel article-sidebar-panel article-sidebar-section">
          <p className="eyebrow">Collections</p>
          <h2 className="sidebar-title">{collectionsLabel}</h2>
          <div className="collection-sidebar-groups">
            {collectionGroups.map((group) => (
              <section className="collection-sidebar-group" key={group.slug}>
                <h3 className="collection-sidebar-title">
                  <Link href={`/collections/${group.slug}`}>{group.name}</Link>
                </h3>
                <ol className="collection-sidebar-list">
                  {group.items.map((item) => (
                    <li className="collection-sidebar-item" key={`${group.slug}-${item.slug}`}>
                      <Link
                        className={`collection-sidebar-link${item.isCurrent ? " collection-sidebar-link-current" : ""}`}
                        href={`/posts/${item.slug}`}
                      >
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
