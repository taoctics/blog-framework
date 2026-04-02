export type IsoDateParts = {
  year: number;
  month: number;
  day: number;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

export function slugifySegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseIsoDateParts(value: string): IsoDateParts | null {
  if (!ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));
  const parsedDate = createUtcDate(year, month, day);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function compareIsoDatesDescending(left: string, right: string) {
  return right.localeCompare(left);
}

export function toUtcDate(value: string) {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  return createUtcDate(parts.year, parts.month, parts.day);
}

export function toUtcIsoString(value: string) {
  return toUtcDate(value).toISOString();
}

export function toUtcRfc822String(value: string) {
  return toUtcDate(value).toUTCString();
}

export function formatIsoDate(
  value: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
    ...options
  }).format(toUtcDate(value));
}

export function formatMonthLabel(year: number, month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC"
  }).format(createUtcDate(year, month, 1));
}
