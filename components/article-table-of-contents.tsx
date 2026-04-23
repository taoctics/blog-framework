"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"toc" | "collections">(items.length > 0 ? "toc" : "collections");
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);

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

  useEffect(() => {
    const link = activeLinkRef.current;

    if (!link) {
      return;
    }

    const scrollContainer = link.closest(".article-drawer-body");

    if (!(scrollContainer instanceof HTMLElement)) {
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const topGap = linkRect.top - containerRect.top;
    const bottomGap = linkRect.bottom - containerRect.bottom;

    if (topGap < 12) {
      scrollContainer.scrollBy({ top: topGap - 12, behavior: "smooth" });
    } else if (bottomGap > -12) {
      scrollContainer.scrollBy({ top: bottomGap + 12, behavior: "smooth" });
    }
  }, [activeId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (items.length === 0 && collectionGroups.length === 0) {
    return null;
  }

  const openPanel = (panel: "toc" | "collections") => {
    if (activePanel === panel) {
      setIsOpen((current) => !current);
      return;
    }

    setActivePanel(panel);
    setIsOpen(true);
  };

  const showToc = activePanel === "toc" && items.length > 0;
  const showCollections = activePanel === "collections" && collectionGroups.length > 0;
  const drawerTitle = showCollections ? collectionsLabel : title;

  return (
    <aside
      aria-label="文章导航"
      className={`article-sidebar-stack${isOpen ? " article-sidebar-stack-open" : ""}`}
    >
      <div className="article-side-tabs" role="tablist" aria-label="文章导航类型">
        {items.length > 0 ? (
          <button
            aria-label="展开目录"
            aria-controls="article-side-drawer"
            aria-expanded={isOpen && activePanel === "toc"}
            aria-selected={activePanel === "toc"}
            className="article-side-tab"
            onClick={() => openPanel("toc")}
            role="tab"
            type="button"
          >
            <svg aria-hidden="true" className="article-side-tab-icon" viewBox="0 0 24 24">
              <path d="M5 7.25h14M5 12h14M5 16.75h9" />
              <circle cx="18.5" cy="16.75" r="0.85" />
            </svg>
          </button>
        ) : null}
        {collectionGroups.length > 0 ? (
          <button
            aria-label="展开合集"
            aria-controls="article-side-drawer"
            aria-expanded={isOpen && activePanel === "collections"}
            aria-selected={activePanel === "collections"}
            className="article-side-tab"
            onClick={() => openPanel("collections")}
            role="tab"
            type="button"
          >
            <svg aria-hidden="true" className="article-side-tab-icon" viewBox="0 0 24 24">
              <path d="M7 5.5h8.5A2.5 2.5 0 0 1 18 8v10.5l-6-3.2-6 3.2V6.5a1 1 0 0 1 1-1Z" />
              <path d="M9 9h6M9 12h4" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="article-side-drawer" id="article-side-drawer">
        <header className="article-drawer-head">
          <div>
            <p className="eyebrow">{showCollections ? "Collections" : "Sections"}</p>
            <h2 className="sidebar-title">{drawerTitle}</h2>
          </div>
          <button
            aria-label="收起文章导航"
            className="article-drawer-close"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <svg aria-hidden="true" className="article-drawer-close-icon" viewBox="0 0 24 24">
              <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
            </svg>
          </button>
        </header>

        <div className="article-drawer-body">
          {showToc ? (
            <nav aria-label={title}>
              <ol className="toc-list">
                {items.map((item) => {
                  const isActive = activeId === item.id;

                  return (
                    <li className="toc-item" key={item.id}>
                      <a
                        className={`toc-link toc-level-${item.level}${isActive ? " toc-link-active" : ""}`}
                        href={`#${item.id}`}
                        onClick={() => setIsOpen(false)}
                        ref={isActive ? activeLinkRef : null}
                      >
                        {item.text}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}

          {showCollections ? (
            <div className="collection-sidebar-groups">
              {collectionGroups.map((group) => (
                <section className="collection-sidebar-group" key={group.slug}>
                  <h3 className="collection-sidebar-title">
                    <Link href={`/collections/${group.slug}`} onClick={() => setIsOpen(false)}>
                      {group.name}
                    </Link>
                  </h3>
                  <ol className="collection-sidebar-list">
                    {group.items.map((item) => (
                      <li className="collection-sidebar-item" key={`${group.slug}-${item.slug}`}>
                        <Link
                          className={`collection-sidebar-link${item.isCurrent ? " collection-sidebar-link-current" : ""}`}
                          href={`/posts/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : null}

          {!showToc && !showCollections ? (
            <p className="article-drawer-empty">暂无可用导航。</p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
