#!/usr/bin/env node
/**
 * devto-crosspost
 *
 * Writes a dev.to-ready markdown draft for every English post that is NOT yet
 * on dev.to, with a `canonical_url` pointing back to the original on
 * khriztianmoreno.dev. Emitted files default to `published: false` (drafts).
 *
 * Usage:
 *   node scripts/devto-crosspost.js            # generate drafts
 *   node scripts/devto-crosspost.js --list     # only print the pending list
 */

const fs = require('node:fs');
const path = require('node:path');
const { collectPendingPosts } = require('./lib/posts');

const OUT_DIR = path.join(process.cwd(), 'scripts', 'devto-export');
const listOnly = process.argv.includes('--list');

/** Builds the dev.to front matter + body for a draft. */
function toDevtoMarkdown(post) {
  const fm = [
    '---',
    `title: ${post.title}`,
    'published: false',
    `tags: ${post.tags.join(', ')}`,
    `canonical_url: ${post.canonical}`,
    '---',
    '',
  ].join('\n');
  return fm + post.body + '\n';
}

async function main() {
  const { pending, skipped, total } = await collectPendingPosts({ order: 'date' });

  console.log(`English posts:         ${total}`);
  console.log(`Already on dev.to:     ${skipped.length}`);
  console.log(`Pending to cross-post: ${pending.length}`);
  console.log('');

  if (skipped.length) {
    console.log('Skipped (already on dev.to in English):');
    skipped.forEach((t) => console.log(`  - ${t}`));
    console.log('');
  }

  console.log('Pending (oldest original first):');
  pending.forEach((p) => console.log(`  - ${p.title}  ->  ${p.canonical}`));

  if (listOnly) return;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const p of pending) {
    fs.writeFileSync(path.join(OUT_DIR, p.filename), toDevtoMarkdown(p), 'utf-8');
  }
  console.log('');
  console.log(`Wrote ${pending.length} draft(s) to ${path.relative(process.cwd(), OUT_DIR)}/`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
