import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastToString } from 'mdast-util-to-string';

/**
 * Matches the excerpt delimiter. Posts are MDX, where HTML comments are a
 * syntax error, so the marker is an MDX comment whose text is `more`
 * (written as `{` + `/* more *` + `/}` in a post). The legacy
 * `<!--more-->` form (from the Astro/markdown era) is still recognized so
 * the excerpt logic and the cross-posting scripts keep working on any old
 * content that slips through.
 */
export const MORE_MARK_RE = /\{\s*\/\*\s*more\s*\*\/\s*\}|<!--\s*more\s*-->/;

/** One entry in a post's table of contents, built from its `h2`/`h3` headings. */
export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

const EXCERPT_FALLBACK_LENGTH = 200;

/**
 * Extracts the excerpt from a post's raw MDX source: everything before the
 * `more` marker (see `MORE_MARK_RE`), stripped down to plain text with
 * mdast-util-from-markdown + mdast-util-to-string (ported from the Astro
 * project's `getDescFromMdString`). The source is sliced at the marker
 * *before* parsing, so the MDX comment never reaches the plain-markdown
 * parser. Without a marker, falls back to a truncated version of the whole
 * body.
 */
export function getDescFromMdString(mdString: string): string {
  const match = MORE_MARK_RE.exec(mdString);
  if (match) {
    return mdastToString(fromMarkdown(mdString.slice(0, match.index))).trim();
  }
  const trimmed = mdastToString(fromMarkdown(mdString)).trim();
  if (trimmed.length <= EXCERPT_FALLBACK_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, EXCERPT_FALLBACK_LENGTH).trimEnd()}…`;
}
