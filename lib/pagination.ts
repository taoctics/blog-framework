export type PaginatedItems<T> = {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
  if (!Number.isInteger(currentPage) || currentPage < 1) {
    return null;
  }

  const totalItems = items.length;
  const totalPages = getTotalPages(totalItems, pageSize);

  if (currentPage > totalPages) {
    return null;
  }

  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalItems,
    totalPages,
    pageSize
  } satisfies PaginatedItems<T>;
}

export function buildPageHref(basePath: string, page: number) {
  const normalizedBasePath =
    basePath === "/" ? "" : basePath.replace(/\/+$/, "");

  if (page <= 1) {
    return normalizedBasePath || "/";
  }

  return `${normalizedBasePath}/page/${page}`;
}

export function getStaticPageNumbers(totalItems: number, pageSize: number) {
  const totalPages = getTotalPages(totalItems, pageSize);

  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function getPaginationSlots(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const slots: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    slots.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    slots.push(page);
  }

  if (end < totalPages - 1) {
    slots.push("ellipsis-right");
  }

  slots.push(totalPages);

  return slots;
}
