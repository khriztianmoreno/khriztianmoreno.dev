#!/usr/bin/env node
/**
 * devto-upload
 *
 * Schedules the pending English posts to dev.to via the REST API, one per day
 * starting from a future date, using the (undocumented) `published_at` front
 * matter field together with `published: true`.
 *
 * ⚠️  dev.to does NOT officially document API scheduling. If the API ignores
 * `published_at`, every post with `published: true` goes live IMMEDIATELY.
 * To avoid blasting all posts at once, this script:
 *   - runs as a DRY RUN unless you pass --confirm, and
 *   - supports --limit so you can schedule ONE post first, verify on dev.to
 *     that it shows as "scheduled" (not live), and only then run the rest.
 *
 * Auth: set DEV_TO_API_KEY (dev.to → Settings → Extensions → DEV API Keys).
 *
 * Usage:
 *   node scripts/devto-upload.js                       # dry run, all pending
 *   node scripts/devto-upload.js --limit 1             # dry run, first post only
 *   DEV_TO_API_KEY=xxx node scripts/devto-upload.js --limit 1 --confirm   # schedule ONE (test)
 *   DEV_TO_API_KEY=xxx node scripts/devto-upload.js --confirm             # schedule the rest
 *
 * Options:
 *   --start YYYY-MM-DD   First publish date (default: tomorrow, UTC)
 *   --time HH:MM         Publish time, UTC (default: 13:00)
 *   --interval-days N    Days between posts (default: 1)
 *   --limit N            Only process the first N pending posts
 *   --order date|alpha   Ordering (default: date = oldest original first)
 *   --confirm            Actually POST to dev.to (otherwise dry run)
 */

require('./lib/env');
const { collectPendingPosts } = require('./lib/posts');

const API_URL = 'https://dev.to/api/articles';
const RATE_LIMIT_MS = 4000; // dev.to allows ~10 requests / 30s

function parseArgs(argv) {
  const args = { time: '13:00', intervalDays: 1, order: 'date', confirm: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--confirm') args.confirm = true;
    else if (a === '--start') args.start = argv[++i];
    else if (a === '--time') args.time = argv[++i];
    else if (a === '--interval-days') args.intervalDays = Number(argv[++i]);
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else if (a === '--order') args.order = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

/** Start date at 00:00 UTC. Defaults to tomorrow. */
function resolveStartDate(start) {
  if (start) {
    const d = new Date(`${start}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) throw new Error(`Invalid --start date: ${start}`);
    return d;
  }
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
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

/** Computes the published_at Date for the i-th post. */
function publishedAtFor(startDate, time, intervalDays, index) {
  const [hh, mm] = time.split(':').map(Number);
  const d = new Date(startDate);
  d.setUTCDate(d.getUTCDate() + index * intervalDays);
  d.setUTCHours(hh, mm, 0, 0);
  return d;
}

/** Full markdown (front matter + body) for a scheduled post. */
function buildBodyMarkdown(post, publishedAt) {
  return [
    '---',
    `title: ${post.title}`,
    'published: true',
    `published_at: ${publishedAt}`,
    `tags: ${post.tags.join(', ')}`,
    `canonical_url: ${post.canonical}`,
    '---',
    '',
    post.body,
  ].join('\n');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postArticle(apiKey, bodyMarkdown) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.forem.api-v1+json',
      'api-key': apiKey,
    },
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
  const startDate = resolveStartDate(args.start);

  const apiKey = process.env.DEV_TO_API_KEY;
  const live = args.confirm;

  if (live && !apiKey) {
    throw new Error('DEV_TO_API_KEY is required with --confirm. Export it and retry.');
  }

  // Pass the key so dedup also excludes drafts/scheduled posts (hidden from the
  // public feed) — otherwise a re-run would duplicate already-scheduled posts.
  const { pending } = await collectPendingPosts({ order: args.order, apiKey });
  const queue = args.limit ? pending.slice(0, args.limit) : pending;

  console.log(live ? '=== LIVE (posting to dev.to) ===' : '=== DRY RUN (no requests sent) ===');
  console.log(`Posts to schedule: ${queue.length}${args.limit ? ` (limited from ${pending.length})` : ''}`);
  console.log(`First publish:     ${formatPublishedAt(publishedAtFor(startDate, args.time, args.intervalDays, 0))}`);
  console.log(`Cadence:           every ${args.intervalDays} day(s) at ${args.time} UTC`);
  console.log('');

  let okCount = 0;
  for (let i = 0; i < queue.length; i++) {
    const post = queue[i];
    const publishedAt = formatPublishedAt(
      publishedAtFor(startDate, args.time, args.intervalDays, i)
    );
    const bodyMarkdown = buildBodyMarkdown(post, publishedAt);

    if (!live) {
      console.log(`[dry] ${publishedAt}  ${post.title}`);
      console.log(`      canonical: ${post.canonical}  tags: ${post.tags.join(', ')}`);
      continue;
    }

    const { ok, status, json } = await postArticle(apiKey, bodyMarkdown);
    if (ok) {
      okCount++;
      console.log(`[ok ${status}] ${publishedAt}  ${post.title}`);
      console.log(`           -> ${json.url ?? '(no url returned)'}`);
    } else {
      console.error(`[ERR ${status}] ${post.title}`);
      console.error(`           ${JSON.stringify(json)}`);
      if (status === 401) throw new Error('Unauthorized: check DEV_TO_API_KEY.');
      if (status === 429) {
        console.error('           Rate limited. Stopping. Re-run later with --start set past the last scheduled date.');
        break;
      }
    }

    if (i < queue.length - 1) await sleep(RATE_LIMIT_MS);
  }

  if (live) {
    console.log('');
    console.log(`Done. ${okCount}/${queue.length} posted.`);
    console.log('⚠️  Open dev.to now and confirm the article(s) show as SCHEDULED, not live.');
    console.log('   If they went live immediately, the API ignored published_at — unpublish and use a cron instead.');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
