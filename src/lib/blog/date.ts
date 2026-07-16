/**
 * Date helpers ported from the Astro source project's `src/utils/date.ts`,
 * trimmed to what `posts.ts` and `og-image.tsx` actually use.
 */

/** Formats a date as `YYYY-MM-DD`. */
export function getFormattedDate(date: number | string | Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

/**
 * Returns the later (closer to "now" relative to publish) of two date
 * strings, formatted as `YYYY-MM-DD`. Mirrors Astro's `getCloserFormattedDate`:
 * when a post has both `date` and `updated`, the more recent one wins.
 */
export function getCloserFormattedDate(
  dateStringA?: string,
  dateStringB?: string
): string | undefined {
  if (!dateStringA && !dateStringB) return undefined;
  if (!dateStringA) return dateStringB;
  if (!dateStringB) return dateStringA;

  const dateA = new Date(dateStringA);
  const dateB = new Date(dateStringB);
  const dateToReturn = dateA < dateB ? dateB : dateA;
  return dateToReturn.toISOString().slice(0, 10);
}

/** Formats a date for the OG image card, e.g. "July 16, 2026". */
export function formatDateForOg(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
