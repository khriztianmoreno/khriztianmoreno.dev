import { getAllPosts } from '@/lib/blog/posts';
import { getDescFromMdString } from '@/lib/blog/markdown';

const SITE_URL = 'https://khriztianmoreno.dev';
const SITE_TITLE = 'Khriztian Moreno — Blog';
const SITE_DESCRIPTION =
  'Articles on web performance, React, JavaScript, and full stack engineering by Khriztian Moreno.';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * RSS 2.0 feed for the English posts, ported from the Astro source
 * project's `src/pages/rss.xml.ts` (which used `@astrojs/rss` over an
 * Astro content collection) — reading local posts via `getAllPosts('en')`
 * instead, and hand-building the XML since there's no RSS-builder
 * dependency in this port.
 */
export function GET() {
  const posts = getAllPosts('en');

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
      const description = post.data.description || getDescFromMdString(post.body);
      const pubDate = (post.data.updated ?? post.data.date).toUTCString();

      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
