import { z } from 'zod';

/**
 * Frontmatter schema for a blog post markdown file, ported from the Astro
 * source project's `src/schemas/post.ts` (which used `astro:content`'s
 * re-exported zod). Dates in frontmatter are parsed as YAML dates by
 * gray-matter, so they already arrive as `Date` instances here.
 */
export const PostFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  date: z.date(),
  updated: z.date().optional(),
  license: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export type Lang = 'en' | 'es';

/**
 * A fully-loaded post: validated frontmatter plus the raw markdown body,
 * addressed by explicit `lang` + `slug` (the language is a content
 * directory in this port, not part of the slug like Astro's `[lang]/[...slug]`).
 */
export interface Post {
  lang: Lang;
  slug: string;
  data: PostFrontmatter;
  body: string;
}

/**
 * A lightweight summary of a post used for listing pages (blog index,
 * homepage teaser, tag pages) — ported from Astro's `PostSnapshotSchema`.
 */
export interface PostSnapshot {
  title: string;
  description: string;
  tags: string[];
  slug: string;
  href: string;
  date: string;
}
