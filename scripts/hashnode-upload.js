#!/usr/bin/env node
/**
 * hashnode-upload
 *
 * Cross-posts the English posts that are NOT yet on your Hashnode publication,
 * via the GraphQL `publishPost` mutation, with the canonical pointing back to
 * the original on khriztianmoreno.dev (`originalArticleURL`).
 *
 * Unlike the dev.to uploader this publishes IMMEDIATELY (Hashnode's API has no
 * verified future-scheduling). To drip instead of flooding your blog, use
 * `--limit N` per run (dedup is reliable: a published post is skipped next run),
 * e.g. run `--limit 1 --confirm` once a day (manually or via cron).
 *
 * Safe by default: DRY RUN unless you pass --confirm.
 *
 * Auth: set HASHNODE_API_KEY (Hashnode → Settings → Developer → Personal Access Token).
 *
 * Usage:
 *   node scripts/hashnode-upload.js                               # dry run, all pending
 *   node scripts/hashnode-upload.js --limit 1                     # dry run, first only
 *   HASHNODE_API_KEY=xxx node scripts/hashnode-upload.js --limit 1 --confirm   # publish ONE (test)
 *   HASHNODE_API_KEY=xxx node scripts/hashnode-upload.js --confirm             # publish the rest
 *
 * Options:
 *   --limit N              Only process the first N pending posts
 *   --order date|alpha     Ordering (default: date = oldest original first)
 *   --publication-host H   Target publication host (default: your first one)
 *   --backdate             Set publishedAt to the post's original date (experimental; verify in test)
 *   --confirm              Actually publish (otherwise dry run)
 */

require('./lib/env');
const { listEnglishPosts, normalizeTitle } = require('./lib/posts');

const ENDPOINT = 'https://gql.hashnode.com';
const RATE_LIMIT_MS = 2000;

function parseArgs(argv) {
  const args = { order: 'date', confirm: false, backdate: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--confirm') args.confirm = true;
    else if (a === '--backdate') args.backdate = true;
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else if (a === '--order') args.order = argv[++i];
    else if (a === '--publication-host') args.publicationHost = argv[++i];
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

/** Hashnode tags: up to 5 objects { slug, name }. slug = hyphenated-alphanumeric. */
function hashnodeTags(rawTags) {
  const seen = new Set();
  const out = [];
  for (const raw of rawTags) {
    const slug = String(raw)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      out.push({ slug, name: String(raw) });
    }
    if (out.length === 5) break;
  }
  return out;
}

async function gql(apiKey, query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
    redirect: 'manual',
  });

  // A redirect or non-JSON body means the request never reached the GraphQL
  // layer — since 2026 Hashnode redirects API calls without a Pro plan to its
  // announcement page. Surface that instead of silently treating it as "no data".
  if (res.status >= 300 && res.status < 400) {
    throw new Error(
      `endpoint redirected (HTTP ${res.status} -> ${res.headers.get('location')}). ` +
        `Hashnode's API now requires a paid Pro plan on the publication.`
    );
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    throw new Error(
      `non-JSON response (HTTP ${res.status}, ${contentType || 'no content-type'}). ` +
        `Likely the Pro-plan requirement or a moved endpoint.`
    );
  }

  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors ? json.errors.map((e) => e.message).join('; ') : `HTTP ${res.status}`;
    throw new Error(`Hashnode API error: ${msg}`);
  }
  return json.data;
}

/** Resolves the target publication { id, host } for the token owner. */
async function resolvePublication(apiKey, preferredHost) {
  const data = await gql(
    apiKey,
    `query Me { me { publications(first: 50) { edges { node { id url title } } } } }`,
    {}
  );
  const nodes = (data?.me?.publications?.edges ?? []).map((e) => e.node);
  if (nodes.length === 0) throw new Error('No publications found for this token.');
  const pick = preferredHost
    ? nodes.find((n) => new URL(n.url).host === preferredHost)
    : nodes[0];
  if (!pick) throw new Error(`Publication host not found: ${preferredHost}`);
  return { id: pick.id, host: new URL(pick.url).host, title: pick.title };
}

/** Normalized titles already on the publication (published posts). */
async function fetchPublicationTitles(apiKey, host) {
  const titles = new Set();
  let after = null;
  for (;;) {
    const data = await gql(
      apiKey,
      `query Posts($host: String!, $after: String) {
        publication(host: $host) {
          posts(first: 20, after: $after) {
            edges { node { title } }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { host, after }
    );
    const conn = data?.publication?.posts;
    if (!conn) break;
    conn.edges.forEach((e) => titles.add(normalizeTitle(e.node.title)));
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return titles;
}

async function publishPost(apiKey, input) {
  const data = await gql(
    apiKey,
    `mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) { post { id title slug url } }
    }`,
    { input }
  );
  return data.publishPost.post;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = process.env.HASHNODE_API_KEY;
  const live = args.confirm;

  if (live && !apiKey) {
    throw new Error('HASHNODE_API_KEY is required with --confirm. Export it and retry.');
  }

  const allPosts = listEnglishPosts({ order: args.order });

  // Dedup needs the API; without it (dry run, no key) we can only preview all.
  let publishedTitles = new Set();
  let publication = null;
  if (apiKey) {
    try {
      publication = await resolvePublication(apiKey, args.publicationHost);
      publishedTitles = await fetchPublicationTitles(apiKey, publication.host);
    } catch (err) {
      // Live mode can't publish without a resolved publication; dry run can still preview.
      if (live) throw err;
      console.warn(`(dedup skipped — ${err.message})`);
    }
  }

  const pending = allPosts.filter((p) => !publishedTitles.has(normalizeTitle(p.title)));
  const queue = args.limit ? pending.slice(0, args.limit) : pending;

  console.log(live ? '=== LIVE (publishing to Hashnode) ===' : '=== DRY RUN (no mutations sent) ===');
  if (publication) console.log(`Publication:       ${publication.title} (${publication.host})`);
  else console.log('Publication:       (not resolved — dedup skipped in this preview)');
  console.log(`Posts to publish:  ${queue.length}${args.limit ? ` (limited from ${pending.length})` : ''}`);
  console.log('');

  let okCount = 0;
  for (let i = 0; i < queue.length; i++) {
    const post = queue[i];
    const input = {
      publicationId: publication?.id,
      title: post.title,
      contentMarkdown: post.body,
      originalArticleURL: post.canonical,
      tags: hashnodeTags(post.tags),
    };
    if (args.backdate && post.date) {
      input.publishedAt = new Date(post.date).toISOString();
    }

    if (!live) {
      console.log(`[dry] ${post.title}`);
      console.log(`      canonical: ${post.canonical}  tags: ${input.tags.map((t) => t.slug).join(', ')}`);
      continue;
    }

    try {
      const published = await publishPost(apiKey, input);
      okCount++;
      console.log(`[ok] ${published.title}`);
      console.log(`     -> ${published.url}`);
    } catch (err) {
      console.error(`[ERR] ${post.title}`);
      console.error(`      ${err.message}`);
    }

    if (i < queue.length - 1) await sleep(RATE_LIMIT_MS);
  }

  if (live) {
    console.log('');
    console.log(`Done. ${okCount}/${queue.length} published.`);
    console.log('⚠️  Open Hashnode and confirm the canonical ("originally published at") points to khriztianmoreno.dev.');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
