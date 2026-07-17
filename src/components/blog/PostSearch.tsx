'use client';

import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';

import { type Lang, type PostSnapshot } from '@/lib/blog/schema';
import { getBlogTranslations } from './i18n';
import PostCard from './PostCard';

const fuseOptions = {
  keys: ['slug', 'title', 'description', 'tags'],
  threshold: 0.3,
};

interface PostSearchProps {
  lang: Lang;
  snapshots: PostSnapshot[];
}

/**
 * Client-side fuzzy search over the post listing, ported from the Astro
 * source project's `src/components/post-stack.tsx` (Fuse.js + debounced
 * query input), restyled with this site's glass-card / neon-green tokens.
 */
const PostSearch = ({ lang, snapshots }: PostSearchProps) => {
  const t = getBlogTranslations(lang);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const fuse = useMemo(() => new Fuse(snapshots, fuseOptions), [snapshots]);

  const results = useMemo(() => {
    if (debouncedQuery.trim() === '') return snapshots;
    return fuse.search(debouncedQuery).map((result) => result.item);
  }, [debouncedQuery, fuse, snapshots]);

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto w-full max-w-md">
        <label className="sr-only" htmlFor="blog-search">
          {t('search.placeholder')}
        </label>
        <input
          id="blog-search"
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-on-surface placeholder-on-surface-variant outline-none transition focus:border-primary/50 focus:bg-white/10"
        />
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((snapshot) => (
            <PostCard key={snapshot.slug} lang={lang} snapshot={snapshot} />
          ))}
        </div>
      ) : (
        <p className="text-center text-on-surface-variant">
          {t('search.noResults')}
        </p>
      )}
    </div>
  );
};

export default PostSearch;
