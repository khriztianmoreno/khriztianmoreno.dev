import Container from '@/components/common/UI/Container';
import FadeIn from '@/components/common/FadeIn';
import Heading from '@/components/common/Heading';
import { type Lang } from '@/lib/blog/schema';
import { getPostsByTag } from '@/lib/blog/posts';
import { getBlogTranslations } from './i18n';
import PostCard from './PostCard';

interface TagPostsProps {
  lang: Lang;
  tag: string;
}

const TagPosts = ({ lang, tag }: TagPostsProps) => {
  const t = getBlogTranslations(lang);
  const snapshots = getPostsByTag(lang, tag);

  return (
    <section className="relative px-6 py-30">
      <Container fullWidth>
        <FadeIn>
          <div className="mx-auto mb-16 max-w-300 text-center">
            <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
              {t('postsWithTag')}
            </span>
            <Heading
              as="h1"
              className="font-display text-4xl md:text-6xl"
              content={`#${tag}`}
            />
          </div>
        </FadeIn>
        {snapshots.length > 0 ? (
          <div className="mx-auto grid max-w-300 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {snapshots.map((snapshot) => (
              <PostCard key={snapshot.slug} lang={lang} snapshot={snapshot} />
            ))}
          </div>
        ) : (
          <p className="text-center text-on-surface-variant">
            {t('search.noResults')}
          </p>
        )}
      </Container>
    </section>
  );
};

export default TagPosts;
