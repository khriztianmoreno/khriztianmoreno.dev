import { type Lang } from '@/lib/blog/schema';

/**
 * URL helpers for the blog routes. English lives at the root (`/blog/...`,
 * canonical, no `/en` prefix); Spanish is mirrored under `/es/blog/...`.
 *
 * Slugs may contain characters like `(`, `)`, `:`, `"`, `'` (see
 * `src/lib/blog/posts.ts`'s `slugFromFilename` note) — every helper here
 * percent-encodes the slug/tag segment so the resulting href is a valid URL.
 * Next.js decodes the incoming URL before matching it against the
 * `generateStaticParams` values, so this pairs correctly with route params
 * that receive the raw (decoded) slug.
 */

function langBase(lang: Lang): string {
  return lang === 'en' ? '' : `/${lang}`;
}

/**
 * Decodes a dynamic route param (slug or tag) coming from Next's
 * `params`. Next's static-generation workers have been observed to
 * deliver `params.slug`/`params.tag` still percent-encoded for characters
 * `encodeURIComponent` escapes (e.g. `:`, `"`) but not for others (e.g.
 * `(`, `)`), even though `generateStaticParams` returned the raw (decoded)
 * value. Decoding here is a no-op for already-decoded values, so it's safe
 * to call unconditionally on every param.
 */
export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function blogIndexHref(lang: Lang): string {
  return `${langBase(lang)}/blog`;
}

export function postHref(lang: Lang, slug: string): string {
  return `${langBase(lang)}/blog/${encodeURIComponent(slug)}`;
}

export function ogImageHref(lang: Lang, slug: string): string {
  return `${langBase(lang)}/blog/og/${encodeURIComponent(slug)}`;
}

export function tagsIndexHref(lang: Lang): string {
  return `${langBase(lang)}/blog/tags`;
}

export function tagHref(lang: Lang, tag: string): string {
  return `${langBase(lang)}/blog/tags/${encodeURIComponent(tag)}`;
}
