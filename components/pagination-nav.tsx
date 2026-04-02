import Link from "next/link";

import { buildPageHref, getPaginationSlots } from "@/lib/pagination";

type PaginationNavProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
};

export function PaginationNav({
  basePath,
  currentPage,
  totalPages,
  previousLabel,
  nextLabel
}: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  const slots = getPaginationSlots(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="panel pagination-nav">
      <div className="pagination-status">
        第 {currentPage} / {totalPages} 页
      </div>

      <div className="pagination-links">
        {currentPage > 1 ? (
          <Link className="pagination-link" href={buildPageHref(basePath, currentPage - 1)}>
            {previousLabel}
          </Link>
        ) : null}

        {slots.map((slot) =>
          typeof slot === "number" ? (
            <Link
              aria-current={slot === currentPage ? "page" : undefined}
              className={slot === currentPage ? "pagination-link pagination-link-current" : "pagination-link"}
              href={buildPageHref(basePath, slot)}
              key={slot}
            >
              {slot}
            </Link>
          ) : (
            <span className="pagination-ellipsis" key={slot}>
              …
            </span>
          )
        )}

        {currentPage < totalPages ? (
          <Link className="pagination-link" href={buildPageHref(basePath, currentPage + 1)}>
            {nextLabel}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
