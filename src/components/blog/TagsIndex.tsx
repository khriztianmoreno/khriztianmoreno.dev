import Link from 'next/link';

import Container from '@/components/common/UI/Container';
import FadeIn from '@/components/common/FadeIn';
import Heading from '@/components/common/Heading';
import { type Lang } from '@/lib/blog/schema';
import { getAllTags } from '@/lib/blog/posts';
import { getBlogTranslations } from './i18n';
import { tagHref } from './paths';
import { getTagAccentClass } from './tagAccent';

interface TagsIndexProps {
  lang: Lang;
}

const TagsIndex = ({ lang }: TagsIndexProps) => {
  const t = getBlogTranslations(lang);
  const tags = Array.from(getAllTags(lang).entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <section className="relative px-6 py-30">
      <Container fullWidth>
        <FadeIn>
          <div className="mx-auto mb-16 max-w-300 text-center">
            <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
              {t('nav.tags')}
            </span>
            <Heading
              as="h1"
              className="font-display text-4xl md:text-6xl"
              content={t('allTags')}
            />
          </div>
        </FadeIn>
        <div className="mx-auto flex max-w-300 flex-wrap justify-center gap-3">
          {tags.map(([tag, count]) => (
            <Link
              key={tag}
              href={tagHref(lang, tag)}
              className={`glass-card flex items-center gap-2 px-5 py-2 font-mono text-sm transition-colors ${getTagAccentClass(
                tag
              )}`}
            >
              #{tag}
              <span className="opacity-70">{count}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TagsIndex;
