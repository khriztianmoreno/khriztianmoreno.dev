/**
 * Shared helpers for the dev.to cross-posting scripts.
 *
 * Collects the English posts that are NOT yet published on dev.to (matched
 * by normalized title) and normalizes the metadata both the draft generator
 * and the API uploader need: slug, canonical URL, sanitized tags, original
 * publish date (for ordering), and the raw markdown body.
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
function sanitizeTags(tags) {
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
    if (out.length === 4) break;
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

/** Fetches normalized titles of ALL the authenticated user's articles,
 * including drafts and SCHEDULED posts (future published_at) that the public
 * feed hides. Required so re-runs don't re-post an already-scheduled article. */
async function fetchOwnTitles(apiKey) {
  const titles = new Set();
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://dev.to/api/articles/me/all?per_page=1000&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.forem.api-v1+json',
          'api-key': apiKey,
        },
      }
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
 * Returns { pending, skipped, total }. `pending` is the list of English posts
 * not yet on dev.to, each: { slug, filename, title, tags, canonical, body, date }.
 * By default pending is ordered oldest-original-first so a daily drip respects
 * the original chronology.
 */
async function collectPendingPosts({ order = 'date', apiKey = null } = {}) {
  if (!fs.existsSync(EN_POSTS_DIR)) {
    throw new Error(`English posts dir not found: ${EN_POSTS_DIR}`);
  }

  const publishedTitles = await fetchDevtoTitles();
  // With a key, also exclude drafts/scheduled posts the public feed hides.
  if (apiKey) {
    const own = await fetchOwnTitles(apiKey);
    own.forEach((t) => publishedTitles.add(t));
  }
  const filenames = fs
    .readdirSync(EN_POSTS_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort();

  const pending = [];
  const skipped = [];

  for (const filename of filenames) {
    const slug = slugFromFilename(filename);
    const raw = fs.readFileSync(path.join(EN_POSTS_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);
    const title = data.title ?? slug;

    if (publishedTitles.has(normalizeTitle(title))) {
      skipped.push(title);
      continue;
    }

    pending.push({
      slug,
      filename,
      title,
      tags: sanitizeTags(data.tags),
      canonical: canonicalUrl(slug),
      body: content.replace(/^\s+/, ''),
      date: data.date ?? null,
      ts: dateToTimestamp(data.date),
    });
  }

  if (order === 'date') {
    pending.sort((a, b) => a.ts - b.ts);
  } else {
    pending.sort((a, b) => a.filename.localeCompare(b.filename));
  }

  return { pending, skipped, total: filenames.length };
}

module.exports = {
  SITE_URL,
  DEVTO_USERNAME,
  EN_POSTS_DIR,
  normalizeTitle,
  slugFromFilename,
  canonicalUrl,
  sanitizeTags,
  fetchDevtoTitles,
  fetchOwnTitles,
  collectPendingPosts,
};
