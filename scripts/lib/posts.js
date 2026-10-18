/**
 * Shared helpers for the cross-posting scripts (dev.to, Hashnode, …).
 *
 * `listEnglishPosts` reads and normalizes every English post (slug, canonical
 * URL, raw tags, original date, body). Each platform script then fetches its
 * own set of already-published titles and filters with `normalizeTitle`.
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const SITE_URL = 'https://khriztianmoreno.dev';
const DEVTO_USERNAME = 'khriztianmoreno';
const EN_POSTS_DIR = path.join(process.cwd(), 'content', 'posts', 'en');

/** Normalizes a title for cross-language-safe comparison: lowercased,
 * accent-stripped, reduced to letters/digits. "React useEffect" -> "reactuseeffect". */
function normalizeTitle(title) {
  return String(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Slug = filename without `.md` (mirrors src/lib/blog/posts.ts). */
function slugFromFilename(filename) {
  return filename.slice(0, -path.extname(filename).length);
}

/** English canonical URL (English lives at the root `/blog/...`). The slug is
 * percent-encoded exactly like the site's `postHref` so the canonical matches
 * the URL the site actually serves. */
function canonicalUrl(slug) {
  return `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
}

/** dev.to tag rules: max 4, lowercase alphanumeric only, deduped. */
function sanitizeTags(tags, max = 4) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(tags) ? tags : []) {
    const clean = String(raw)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
    if (out.length === max) break;
  }
  return out;
}

/** Coerces a front matter `date` (Date object or string) to a timestamp for
 * ordering. Unparseable/missing dates sort last. */
function dateToTimestamp(value) {
  if (value instanceof Date) return value.getTime();
  const parsed = value ? Date.parse(String(value)) : NaN;
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/**
 * Reads every English post and returns them normalized:
 * { slug, filename, title, tags (raw array), canonical, body, date, ts }.
 * `order`: 'date' (oldest original first, default) or 'alpha'.
 */
function listEnglishPosts({ order = 'date' } = {}) {
  if (!fs.existsSync(EN_POSTS_DIR)) {
    throw new Error(`English posts dir not found: ${EN_POSTS_DIR}`);
  }

  const filenames = fs
    .readdirSync(EN_POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort();

  const posts = filenames.map((filename) => {
    const slug = slugFromFilename(filename);
    const raw = fs.readFileSync(path.join(EN_POSTS_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug,
      filename,
      title: data.title ?? slug,
      tags: Array.isArray(data.tags) ? data.tags : [],
      canonical: canonicalUrl(slug),
      body: content.replace(/^\s+/, ''),
      date: data.date ?? null,
      ts: dateToTimestamp(data.date),
    };
  });

  if (order === 'alpha') {
    posts.sort((a, b) => a.filename.localeCompare(b.filename));
  } else {
    posts.sort((a, b) => a.ts - b.ts);
  }

  return posts;
}

/** Fetches the set of normalized titles published on dev.to (public feed:
 * live articles only, no auth needed). */
async function fetchDevtoTitles() {
  const url = `https://dev.to/api/articles?username=${DEVTO_USERNAME}&per_page=1000`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.forem.api-v1+json' },
  });
  if (!res.ok) {
    throw new Error(`dev.to API responded ${res.status} ${res.statusText}`);
  }
  const articles = await res.json();
  return new Set(articles.map((a) => normalizeTitle(a.title)));
}

/** Fetches normalized titles of ALL the authenticated user's dev.to articles,
 * including drafts and SCHEDULED posts (future published_at) that the public
 * feed hides. Required so re-runs don't re-post an already-scheduled article. */
async function fetchOwnTitles(apiKey) {
  const titles = new Set();
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://dev.to/api/articles/me/all?per_page=1000&page=${page}`,
      { headers: { Accept: 'application/vnd.forem.api-v1+json', 'api-key': apiKey } }
    );
    if (!res.ok) {
      throw new Error(`dev.to /articles/me/all responded ${res.status} ${res.statusText}`);
    }
    const articles = await res.json();
    if (!Array.isArray(articles) || articles.length === 0) break;
    articles.forEach((a) => titles.add(normalizeTitle(a.title)));
    if (articles.length < 1000) break;
  }
  return titles;
}

/**
 * dev.to-specific: English posts not yet on dev.to, with dev.to-sanitized tags.
 * Returns { pending, skipped, total }. Pass `apiKey` to also exclude the user's
 * drafts/scheduled posts (hidden from the public feed).
 */
async function collectPendingPosts({ order = 'date', apiKey = null } = {}) {
  const published = await fetchDevtoTitles();
  if (apiKey) {
    (await fetchOwnTitles(apiKey)).forEach((t) => published.add(t));
  }

  const pending = [];
  const skipped = [];
  for (const post of listEnglishPosts({ order })) {
    if (published.has(normalizeTitle(post.title))) {
      skipped.push(post.title);
    } else {
      pending.push({ ...post, tags: sanitizeTags(post.tags) });
    }
  }

  return { pending, skipped, total: pending.length + skipped.length };
}

module.exports = {
  SITE_URL,
  DEVTO_USERNAME,
  EN_POSTS_DIR,
  normalizeTitle,
  slugFromFilename,
  canonicalUrl,
  sanitizeTags,
  dateToTimestamp,
  listEnglishPosts,
  fetchDevtoTitles,
  fetchOwnTitles,
  collectPendingPosts,
};
