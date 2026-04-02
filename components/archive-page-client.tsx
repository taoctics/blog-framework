"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { FilterablePost } from "@/lib/filter-utils";
import { formatIsoDate, formatMonthLabel } from "@/lib/content-utils";
import { matchesFilterQuery } from "@/lib/filter-utils";
import { HighlightedText } from "./highlighted-text";

type ArchivePageClientProps = {
  locale: string;
  posts: FilterablePost[];
  labels: {
    archiveFilterPlaceholder: string;
    archiveYear: string;
    archiveAllYears: string;
    archiveEmpty: string;
    archiveResults: string;
  };
};

type ArchiveEntry = FilterablePost & {
  year: string;
  month: number;
  monthKey: string;
};

function toArchiveEntries(posts: FilterablePost[]) {
  return posts.map((post) => ({
    ...post,
    year: post.date.slice(0, 4),
    month: Number(post.date.slice(5, 7)),
    monthKey: post.date.slice(0, 7)
  }));
}

function groupArchiveEntries(entries: ArchiveEntry[], locale: string) {
  const yearMap = new Map<
    string,
    Map<string, { month: number; label: string; posts: ArchiveEntry[] }>
  >();

  for (const entry of entries) {
    const yearBucket = yearMap.get(entry.year) || new Map();
    const monthBucket = yearBucket.get(entry.monthKey) || {
      month: entry.month,
      label: formatMonthLabel(Number(entry.year), entry.month, locale),
      posts: []
    };

    monthBucket.posts.push(entry);
    yearBucket.set(entry.monthKey, monthBucket);
    yearMap.set(entry.year, yearBucket);
  }

  return Array.from(yearMap.entries())
    .map(([year, months]) => ({
      year,
      months: Array.from(months.entries())
        .map(([key, month]) => ({
          key,
          label: month.label,
          posts: month.posts
        }))
        .toSorted((left, right) => right.key.localeCompare(left.key))
    }))
    .toSorted((left, right) => right.year.localeCompare(left.year));
}

export function ArchivePageClient({ locale, posts, labels }: ArchivePageClientProps) {
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();
  const entries = toArchiveEntries(posts);
  const years = Array.from(new Set(entries.map((entry) => entry.year))).toSorted((left, right) =>
    right.localeCompare(left)
  );
  const filteredEntries = entries.filter((entry) => {
    if (selectedYear && entry.year !== selectedYear) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return matchesFilterQuery(entry, normalizedQuery);
  });
  const groups = groupArchiveEntries(filteredEntries, locale);

  return (
    <div className="stack">
      <section className="panel filter-panel">
        <div className="filter-tools">
          <div className="filter-field">
            <label className="filter-label" htmlFor="archive-filter-input">
              {labels.archiveFilterPlaceholder}
            </label>
            <input
              className="filter-input"
              id="archive-filter-input"
              onChange={(event) => {
                setQuery(event.currentTarget.value);
              }}
              placeholder={labels.archiveFilterPlaceholder}
              type="text"
              value={query}
            />
          </div>

          <div className="filter-field filter-field-select">
            <label className="filter-label" htmlFor="archive-year-select">
              {labels.archiveYear}
            </label>
            <select
              className="filter-select"
              id="archive-year-select"
              onChange={(event) => {
                setSelectedYear(event.currentTarget.value);
              }}
              value={selectedYear}
            >
              <option value="">{labels.archiveAllYears}</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="panel archive-list">
        <div className="archive-summary">
          {labels.archiveResults.replace("__COUNT__", String(filteredEntries.length))}
        </div>

        {groups.length === 0 ? (
          <p className="empty-state">{labels.archiveEmpty}</p>
        ) : (
          groups.map((year) => (
            <div className="archive-year" key={year.year}>
              <h2>{year.year}</h2>
              {year.months.map((month) => (
                <div className="archive-month" key={month.key}>
                  <h3>{month.label}</h3>
                  {month.posts.map((post) => (
                    <div className="archive-entry" key={post.slug}>
                      <Link href={`/posts/${post.slug}`}>
                        <HighlightedText query={normalizedQuery} text={post.title} />
                      </Link>
                      <span>
                        {formatIsoDate(post.date, locale, {
                          year: undefined,
                          month: "numeric",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
