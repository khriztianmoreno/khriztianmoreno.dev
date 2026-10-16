# dev.to cross-posting

Scripts to cross-post the English blog posts to [dev.to](https://dev.to/khriztianmoreno)
with a `canonical_url` pointing back to the original on `khriztianmoreno.dev`.

## Golden rule

The original is **born on your own site first**. dev.to is a *distribution*
channel, not the source. The `canonical_url` tells Google the original lives on
`khriztianmoreno.dev`, so SEO authority consolidates on your domain — even
though dev.to shows the cross-post date (dev.to has no way to backdate).

## Files

| File | Purpose |
| --- | --- |
| `lib/devto-posts.js` | Shared logic: finds English posts not yet on dev.to, builds canonical URLs, sanitizes tags, orders oldest-first. |
| `devto-crosspost.js` | Generates `published: false` draft `.md` files under `devto-export/`. Dedups against the **public** feed only. |
| `devto-upload.js` | Schedules pending posts via the dev.to API, one per day. Dedups against **all** your articles (incl. scheduled) when given an API key. **This is the source of truth for the day-to-day flow.** |

## New-post flow

1. **Publish on `khriztianmoreno.dev` first** (commit + deploy). The site post
   must be live before dev.to publishes, or the `canonical_url` 404s.

2. **See what's new** (dry run, *with* the key so it also skips already-scheduled posts):

   ```sh
   DEV_TO_API_KEY=xxx node scripts/devto-upload.js
   ```

   Everything already on dev.to is skipped; only the new post(s) show up.

3. **Schedule it**:

   ```sh
   DEV_TO_API_KEY=xxx node scripts/devto-upload.js --start 2026-12-18 --confirm
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

Auth: `DEV_TO_API_KEY` from dev.to → Settings → Extensions → "DEV Community API Keys".

## Point social media at your site, never at dev.to

- **Your audience** (X, LinkedIn, newsletter) → `khriztianmoreno.dev/blog/<slug>`.
- **dev.to's audience** discovers you through its own feed/tags; the canonical
  credits your site.

Sending your own followers to dev.to hands your traffic, analytics, and SEO to a
platform you don't control. Your site is the house; dev.to is the flyer on the street.

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
