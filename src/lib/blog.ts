import { XMLParser } from 'fast-xml-parser';

const RSS_URL = 'https://blog.khriztianmoreno.dev/rss.xml';
const MAX_POSTS = 6;
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7; // weekly

export interface BlogPost {
  title: string;
  url: string;
  description: string;
  date: string;
  displayDate: string;
}

function stripHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(input: string, maxLength = 160): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength).trimEnd()}…`;
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

interface RssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(RSS_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`RSS request failed with status ${response.status}`);
    }

    const xml = await response.text();

    // The live feed embeds long article bodies with heavily HTML-escaped
    // code samples, which legitimately exceeds fast-xml-parser's default
    // DoS-mitigation cap of 1000 total entity expansions. Raise it — this is
    // real content, not an entity-expansion attack.
    const parser = new XMLParser({
      ignoreAttributes: false,
      processEntities: { maxTotalExpansions: 20000 },
    });
    const feed = parser.parse(xml);
    const items = toArray<RssItem>(feed?.rss?.channel?.item);

    return items.slice(0, MAX_POSTS).map((item) => {
      const pubDate = new Date(item.pubDate ?? '');

      return {
        title: stripHtml(item.title),
        url: item.link ?? '',
        description: truncate(stripHtml(item.description)),
        date: pubDate.toISOString(),
        displayDate: new Intl.DateTimeFormat('en', {
          month: 'short',
          year: 'numeric',
        }).format(pubDate),
      };
    });
  } catch (error) {
    console.warn(
      `[blog] Failed to fetch/parse RSS feed, rendering without posts: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}
