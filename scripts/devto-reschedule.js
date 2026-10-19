#!/usr/bin/env node
/**
 * devto-reschedule
 *
 * Reschedules the already-created dev.to cross-posts to a single target date
 * by UPDATING each article (`PUT /articles/{id}`) — never deleting/recreating,
 * so URLs, canonical, reactions and comments are preserved.
 *
 * Only articles whose title matches an English post in this repo are touched;
 * anything else on the account is left alone.
 *
 * ⚠️  Setting `published_at` to a future date on an article that is ALREADY
 * live is undocumented behavior. Run with `--limit 1 --confirm` first, open
 * dev.to, and confirm it moved to SCHEDULED before rescheduling the rest.
 *
 * Auth: set DEV_TO_API_KEY (dev.to → Settings → Extensions → DEV API Keys).
 *
 * Usage:
 *   node scripts/devto-reschedule.js                        # dry run, all matched
 *   node scripts/devto-reschedule.js --limit 1              # dry run, first only
 *   node scripts/devto-reschedule.js --limit 1 --confirm    # reschedule ONE (test)
 *   node scripts/devto-reschedule.js --confirm              # reschedule the rest
 *
 * Options:
 *   --date YYYY-MM-DD   Target publish date (default: tomorrow, UTC)
 *   --time HH:MM        Publish time, UTC (default: 13:00)
 *   --limit N           Only process the first N matched articles
 *   --include-live      Also reschedule posts whose date is already in the PAST
 *                       (already visible, incl. your old originals). Default: skip.
 *   --confirm           Actually PUT to dev.to (otherwise dry run)
 *
 * NOTE: dev.to reports `published: true` for SCHEDULED posts too, so "live" is
 * decided by `published_at` vs now — only future-dated posts are rescheduled by
 * default, which protects your already-published back catalog.
 */

require('./lib/env');
const { listEnglishPosts, normalizeTitle, sanitizeTags } = require('./lib/posts');

const API_BASE = 'https://dev.to/api/articles';
const RATE_LIMIT_MS = 4000; // dev.to allows ~10 requests / 30s
const JSON_ACCEPT = 'application/vnd.forem.api-v1+json';

function parseArgs(argv) {
  const args = { time: '13:00', confirm: false, includeLive: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--confirm') args.confirm = true;
    else if (a === '--include-live') args.includeLive = true;
    else if (a === '--date') args.date = argv[++i];
    else if (a === '--time') args.time = argv[++i];
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

/** Target Date at the given UTC time. Defaults to tomorrow. */
function resolveTargetDate(date, time) {
  const [hh, mm] = time.split(':').map(Number);
  let d;
  if (date) {
    d = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) throw new Error(`Invalid --date: ${date}`);
  } else {
    d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  d.setUTCHours(hh, mm, 0, 0);
  return d;
}

/** Formats a Date as dev.to's expected `YYYY-MM-DD HH:MM +0000`. */
function formatPublishedAt(date) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())} ` +
    `${p(date.getUTCHours())}:${p(date.getUTCMinutes())} +0000`
  );
}

/**
 * Full markdown (front matter + body) for a post, rebuilt from the repo with
 * the new `published_at`. Mirrors devto-upload's buildBodyMarkdown so a PUT
 * keeps title/tags/canonical intact and only moves the schedule.
 */
function buildBodyMarkdown(post, publishedAt) {
  return [
    '---',
    `title: ${post.title}`,
    'published: true',
    `published_at: ${publishedAt}`,
    `tags: ${sanitizeTags(post.tags).join(', ')}`,
    `canonical_url: ${post.canonical}`,
    '---',
    '',
    post.body,
  ].join('\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** All of the authenticated user's articles (incl. drafts/scheduled). */
async function fetchOwnArticles(apiKey) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${API_BASE}/me/all?per_page=1000&page=${page}`, {
      headers: { Accept: JSON_ACCEPT, 'api-key': apiKey },
    });
    if (!res.ok) throw new Error(`/articles/me/all responded ${res.status} ${res.statusText}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 1000) break;
  }
  return out;
}

async function putArticle(apiKey, id, bodyMarkdown) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: JSON_ACCEPT, 'api-key': apiKey },
    body: JSON.stringify({ article: { body_markdown: bodyMarkdown } }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.DEV_TO_API_KEY;
  const live = args.confirm;
  if (!apiKey) {
    throw new Error('DEV_TO_API_KEY is required (set it in .env.local).');
  }

  const target = resolveTargetDate(args.date, args.time);
  const publishedAt = formatPublishedAt(target);

  // Posts syndicated from this repo, keyed by normalized title — the only
  // articles we will touch, and the source we rebuild each body from.
  const repoByTitle = new Map(
    listEnglishPosts({}).map((p) => [normalizeTitle(p.title), p])
  );

  const own = await fetchOwnArticles(apiKey);
  const matched = own.filter((a) => repoByTitle.has(normalizeTitle(a.title)));

  // A post is "scheduled" (safe to move) only if its date is still in the
  // future; past-dated posts are already visible — that includes the old
  // back catalog, which we must NOT drag to tomorrow.
  const now = Date.now();
  const isFuture = (a) => {
    const t = Date.parse(a.published_at);
    return !Number.isNaN(t) && t > now;
  };
  const scheduled = matched.filter(isFuture);
  const pastLive = matched.filter((a) => !isFuture(a));

  const targetSet = args.includeLive ? matched : scheduled;
  const queue = args.limit ? targetSet.slice(0, args.limit) : targetSet;

  console.log(live ? '=== LIVE (updating dev.to) ===' : '=== DRY RUN (no PUTs sent) ===');
  console.log(`Target published_at:  ${publishedAt}`);
  console.log(`Matched repo posts:   ${matched.length}`);
  console.log(`  future-scheduled:   ${scheduled.length}  (will reschedule)`);
  console.log(`  already visible:    ${pastLive.length}  ${args.includeLive ? '(INCLUDED via --include-live)' : '(skipped — back catalog)'}`);
  console.log(`Processing:           ${queue.length}${args.limit ? ' (--limit)' : ''}`);
  console.log('');

  let okCount = 0;
  for (let i = 0; i < queue.length; i++) {
    const a = queue[i];
    try {
      const post = repoByTitle.get(normalizeTitle(a.title));
      const newBody = buildBodyMarkdown(post, publishedAt);

      if (!live) {
        console.log(`[dry] #${a.id}  ${a.title}`);
        console.log(`      ${isFuture(a) ? 'scheduled' : 'past/live'} ${a.published_at ?? ''}  ->  ${publishedAt}`);
        continue;
      }

      const { ok, status, json } = await putArticle(apiKey, a.id, newBody);
      if (ok) {
        okCount++;
        console.log(`[ok ${status}] #${a.id}  ${a.title}  ->  ${publishedAt}`);
      } else {
        console.error(`[ERR ${status}] #${a.id}  ${a.title}`);
        console.error(`           ${JSON.stringify(json)}`);
        if (status === 401) throw new Error('Unauthorized: check DEV_TO_API_KEY.');
        if (status === 429) {
          console.error('           Rate limited. Stopping — re-run later to resume.');
          break;
        }
      }
    } catch (err) {
      console.error(`[ERR] #${a.id}  ${a.title}: ${err.message}`);
    }

    if (i < queue.length - 1) await sleep(RATE_LIMIT_MS);
  }

  if (live) {
    console.log('');
    console.log(`Done. ${okCount}/${queue.length} rescheduled.`);
    console.log('⚠️  Open dev.to and confirm the article(s) show as SCHEDULED for the target date.');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
