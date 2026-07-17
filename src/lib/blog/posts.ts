import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import { getDescFromMdString } from './markdown';
import { getCloserFormattedDate } from './date';
import {
  type Lang,
  type Post,
  type PostFrontmatter,
  type PostSnapshot,
  PostFrontmatterSchema,
} from './schema';

export type { Lang, Post, PostFrontmatter, PostSnapshot } from './schema';

const DEFAULT_LANG: Lang = 'en';
const SUPPORTED_LANGS: Lang[] = ['en', 'es'];

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'posts');

function postsDirForLang(lang: Lang): string {
  return path.join(CONTENT_ROOT, lang);
}

/** Derives a slug from a post's filename (basename minus `.md`). No
 * encoding/escaping is applied here — filenames may contain characters
 * like `(`, `)`, `:`, `"`, `'` and `fs.readdirSync`/`path.basename` pass
 * them through untouched. Callers that build URLs must percent-encode the
 * slug themselves (e.g. via `encodeURIComponent`) rather than assume it is
 * already URL-safe. */
function slugFromFilename(filename: string): string {
  return filename.slice(0, -path.extname(filename).length);
}

let cache: Map<Lang, Post[]> | null = null;

/** Reads and validates every post markdown file for a given language. Results are cached per-process (this only runs at build time / on the server). */
function readPostsForLang(lang: Lang): Post[] {
  const dir = postsDirForLang(lang);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const filenames = fs.readdirSync(dir).filter((name) => name.endsWith('.md'));

  return filenames.map((filename) => {
    const fullPath = path.join(dir, filename);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);

    let frontmatter: PostFrontmatter;
    try {
      frontmatter = PostFrontmatterSchema.parse(data);
    } catch (error) {
      throw new Error(
        `Invalid frontmatter in ${path.relative(process.cwd(), fullPath)}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    return {
      lang,
      slug: slugFromFilename(filename),
      data: frontmatter,
      body: content,
    } satisfies Post;
  });
}

function getAllPostsCached(): Map<Lang, Post[]> {
  if (!cache) {
    cache = new Map(SUPPORTED_LANGS.map((lang) => [lang, readPostsForLang(lang)]));
  }
  return cache;
}

/** Groups posts across all languages by their shared slug. Mirrors Astro's `classifyByLangs`, keyed by slug instead of the lang-prefixed slug (language is now a directory, not part of the slug). */
export function classifyByLangs(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    map.set(post.slug, [...(map.get(post.slug) ?? []), post]);
  }
  return map;
}

/**
 * Picks one post per unique slug, in fallback order:
 * 1. The post in the requested language.
 * 2. The post in the default language (English).
 * 3. Whatever language exists first.
 *
 * Ported from Astro's `makeUniqueByLang`.
 */
export function makeUniqueByLang(posts: Post[], expectedLang: Lang): Post[] {
  const classified = classifyByLangs(posts);

  return Array.from(classified.keys()).map((slug) => {
    const versions = classified.get(slug)!;
    return (
      versions.find((version) => version.lang === expectedLang) ||
      versions.find((version) => version.lang === DEFAULT_LANG) ||
      versions[0]
    );
  });
}

/** Returns a Map of tags with lowercased keys and occurrence counts as values. Ported from Astro's `getUniqueLowerCaseTagMap`. */
export function getUniqueLowerCaseTagMap(tags: string[]): Map<string, number> {
  const tagCounts = new Map<string, number>();
  for (const tag of tags) {
    const lowercaseTag = tag.toLowerCase();
    tagCounts.set(lowercaseTag, (tagCounts.get(lowercaseTag) ?? 0) + 1);
  }
  return tagCounts;
}

function toSnapshot(post: Post): PostSnapshot {
  return {
    href: `/${post.lang}/posts/${post.slug}`,
    title: post.data.title,
    date: getCloserFormattedDate(
      post.data.updated?.toISOString(),
      post.data.date.toISOString()
    )!,
    description: getDescFromMdString(post.body),
    slug: post.slug,
    tags: Array.from(getUniqueLowerCaseTagMap(post.data.tags).keys()),
  };
}

/** All posts across every language (unfiltered), from the in-process cache. */
function allPostsFlat(): Post[] {
  return Array.from(getAllPostsCached().values()).flat();
}

/**
 * Returns every post for `lang`, falling back to English (then any
 * available language) for slugs missing a translation — sorted by date
 * descending (using `updated` when present).
 */
export function getAllPosts(lang: Lang): Post[] {
  const unique = makeUniqueByLang(allPostsFlat(), lang);
  return unique.sort((a, b) => {
    const dateA = a.data.updated ?? a.data.date;
    const dateB = b.data.updated ?? b.data.date;
    return dateB.getTime() - dateA.getTime();
  });
}

/** Returns a single post by exact `lang` + `slug` match, or `undefined` if it doesn't exist in that language. */
export function getPostBySlug(lang: Lang, slug: string): Post | undefined {
  return getAllPostsCached()
    .get(lang)
    ?.find((post) => post.slug === slug);
}

/** Returns every slug available for `lang` — for `generateStaticParams`. */
export function getAllSlugs(lang: Lang): string[] {
  return (getAllPostsCached().get(lang) ?? []).map((post) => post.slug);
}

/** Returns listing snapshots (title, description, tags, href, date) for `lang`, unique per slug and sorted by date descending. Ported from Astro's `getSnapshots`. */
export function getSnapshots(lang: Lang): PostSnapshot[] {
  return getAllPosts(lang).map(toSnapshot);
}

/** Returns the `n` most recent post snapshots for `lang` — for the homepage teaser (replaces the old RSS-feed fetch). */
export function getLatestPosts(lang: Lang, n: number): PostSnapshot[] {
  return getSnapshots(lang).slice(0, n);
}

/** Returns a Map of lowercased tag -> occurrence count across all posts for `lang`. */
export function getAllTags(lang: Lang): Map<string, number> {
  const tagCounts = new Map<string, number>();
  for (const post of getAllPosts(lang)) {
    for (const [tag, count] of getUniqueLowerCaseTagMap(post.data.tags)) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + count);
    }
  }
  return tagCounts;
}

/** Returns snapshots for posts tagged with `tag` (case-insensitive) in `lang`, sorted by date descending. */
export function getPostsByTag(lang: Lang, tag: string): PostSnapshot[] {
  const lowerTag = tag.toLowerCase();
  return getSnapshots(lang).filter((snapshot) =>
    snapshot.tags.some((t) => t.toLowerCase() === lowerTag)
  );
}
