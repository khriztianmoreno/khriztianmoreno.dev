import Link from 'next/link';

import { type Lang, type PostSnapshot } from '@/lib/blog/schema';
import { postHref, tagHref } from './paths';
import { getTagAccentClass } from './tagAccent';

interface PostCardProps {
  lang: Lang;
  snapshot: PostSnapshot;
}

const PostCard = ({ lang, snapshot }: PostCardProps) => (
  <div className="glass-card flex h-full flex-col gap-4 p-8 transition-all hover:border-primary/40 hover:shadow-neon">
    <span className="font-mono text-xs uppercase tracking-widest text-primary">
      {snapshot.date}
    </span>
    <Link
      href={postHref(lang, snapshot.slug)}
      className="group flex flex-1 flex-col gap-4"
    >
      <h3 className="text-lg font-bold leading-snug group-hover:text-primary">
        {snapshot.title}
      </h3>
      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-on-surface-variant group-hover:text-on-surface">
        {snapshot.description}
      </p>
    </Link>
    {snapshot.tags.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {snapshot.tags.map((tag) => (
          <Link
            key={tag}
            href={tagHref(lang, tag)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${getTagAccentClass(
              tag
            )}`}
          >
            #{tag}
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default PostCard;
