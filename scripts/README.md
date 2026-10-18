# Blog cross-posting

Scripts to syndicate the English blog posts to discovery platforms
([dev.to](https://dev.to/khriztianmoreno), Hashnode) with the canonical
pointing back to the original on `khriztianmoreno.dev`, plus notes on daily.dev.

## Golden rule

The original is **born on your own site first**. dev.to is a *distribution*
channel, not the source. The `canonical_url` tells Google the original lives on
`khriztianmoreno.dev`, so SEO authority consolidates on your domain — even
though dev.to shows the cross-post date (dev.to has no way to backdate).

## Files

| File | Purpose |
| --- | --- |
| `lib/posts.js` | Shared logic: reads/normalizes English posts (slug, canonical URL, tags, date, body); dev.to dedup helpers. |
| `lib/env.js` | Loads project-root `.env.local` into `process.env` (native, no dependency). |
| `devto-crosspost.js` | Generates `published: false` draft `.md` files under `devto-export/`. Dedups against the **public** feed only. |
| `devto-upload.js` | Schedules pending posts via the dev.to API, one per day. Dedups against **all** your articles (incl. scheduled) when given an API key. **Source of truth for the dev.to day-to-day flow.** |
| `hashnode-upload.js` | Publishes pending posts to your Hashnode publication via GraphQL, canonical via `originalArticleURL`. Publishes immediately; use `--limit` to drip. |

## Configuration (`.env.local`)

The scripts read secrets from the project-root `.env.local` (gitignored) via
Node's native `process.loadEnvFile` — no `dotenv` dependency. Add:

```sh
DEV_TO_API_KEY=your_devto_key
HASHNODE_API_KEY=your_hashnode_token
```

With these set you can drop the inline `KEY=... ` prefix from every command
below. Inline shell vars still work and **take precedence** over the file.

## New-post flow

1. **Publish on `khriztianmoreno.dev` first** (commit + deploy). The site post
   must be live before dev.to publishes, or the `canonical_url` 404s.

2. **See what's new** (dry run, *with* the key so it also skips already-scheduled posts):

   ```sh
   node scripts/devto-upload.js
   ```

   Everything already on dev.to is skipped; only the new post(s) show up.

3. **Schedule it**:

   ```sh
   node scripts/devto-upload.js --start 2026-12-18 --confirm
   ```

   Idempotent and re-runnable: a scheduled/live post is never posted twice.

## `devto-upload.js` options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--confirm` | off (dry run) | Actually POST to dev.to. Without it, nothing is sent. |
| `--start YYYY-MM-DD` | tomorrow (UTC) | First publish date. |
| `--time HH:MM` | `13:00` | Publish time, UTC. |
| `--interval-days N` | `1` | Days between posts. |
| `--limit N` | all | Only process the first N pending posts (use `--limit 1` to test). |
| `--order date\|alpha` | `date` | `date` = oldest original first. |

Auth: `DEV_TO_API_KEY` (from dev.to → Settings → Extensions → "DEV Community API Keys"), set in `.env.local`.

## Hashnode

> ⚠️ **Paid as of 2026.** Hashnode's GraphQL API now requires a **Pro plan** on
> the publication (*"Every API request, queries and mutations, now requires a Pro
> plan"*). Without Pro, calls are redirected (HTTP 301) to an announcement page
> and the script reports that. The script below is ready but only works on Pro.

Hashnode has a GraphQL API (`https://gql.hashnode.com`), so cross-posting
is automatable like dev.to — if you have Pro.

1. **Create a publication (blog) on Hashnode** if you don't have one, then a
   **Personal Access Token:** Hashnode → Settings → Developer → Generate Token.
   Put it in `.env.local` as `HASHNODE_API_KEY`.
2. **Test one post first:**

   ```sh
   node scripts/hashnode-upload.js --limit 1 --confirm
   ```

   Open it on Hashnode and confirm the "originally published at" canonical
   points to `khriztianmoreno.dev`.

3. **Publish the rest** (or keep dripping with `--limit`):

   ```sh
   node scripts/hashnode-upload.js --confirm
   ```

Notes:
- Requires an existing publication; `"No publications found for this token"`
  means you have no Hashnode blog yet (or the token lacks access).
- The target publication is auto-detected from your token (first one). Override
  with `--publication-host your-blog.hashnode.dev`.
- **Publishes immediately** — Hashnode API scheduling isn't verified. To avoid
  flooding, drip with `--limit 1 --confirm` daily (manual or cron). Dedup against
  published posts makes re-runs safe.
- `--backdate` sets `publishedAt` to the post's original date (experimental —
  verify in the test run; Hashnode, unlike dev.to, may preserve the real date).
- Tags: up to 5, as `{ slug, name }`.

## daily.dev

daily.dev is an **aggregator, not a publishing target** — there is nothing to
script. It ingests your RSS and surfaces posts to its dev audience, linking
**straight to your site** (zero duplication, no canonical juggling). Best ROI
for pure discovery.

One-time setup:
1. Your feed is live: `https://www.khriztianmoreno.dev/rss.xml` (68 items, verified).
2. Submit it as a source: daily.dev → your profile → "Suggest new source" (or
   via the daily.dev companion/app), pasting the RSS URL above.
3. New posts appear automatically as your feed updates — nothing to run per post.

## Point social media at your site, never at the platforms

- **Your audience** (X, LinkedIn, newsletter) → `khriztianmoreno.dev/blog/<slug>`.
- **Each platform's audience** (dev.to, Hashnode, daily.dev) discovers you through
  its own feed/tags; the canonical credits your site.

Sending your own followers to a platform hands your traffic, analytics, and SEO to
something you don't control. Your site is the house; the platforms are flyers on the street.

## Caveats

- **API scheduling is undocumented.** dev.to's `published_at` front matter field
  schedules posts, but it is not in the official API docs — it was confirmed by
  testing (a scheduled post 404s publicly and stays out of the public feed until
  its date). Always test one post with `--limit 1 --confirm` first after any
  change, and verify it shows as *scheduled*, not live.
- **No backdating.** dev.to shows the cross-post date, not the original. Original
  date/authorship is preserved on your site via the canonical.
- **Tags are capped at 4**, lowercase-alphanumeric only. The scripts take the
  first 4 repo tags and strip hyphens (`ai-agents` → `aiagents`).
- **dev.to auto-generates slugs** from the title, cleaning special characters
  (`console.log` → `consolelog`). This is cosmetic; the canonical still points
  to the correct `khriztianmoreno.dev` URL.
- **Rate limit:** ~10 requests / 30s. The uploader waits 4s between posts and
  stops cleanly on HTTP 429 (re-run later to resume).
- **Rotate your API key** after a bulk run if it ever appeared in a shell/transcript.
