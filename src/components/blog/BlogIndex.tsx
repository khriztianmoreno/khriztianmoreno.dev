import Container from '@/components/common/UI/Container';
import FadeIn from '@/components/common/FadeIn';
import Heading from '@/components/common/Heading';
import { type Lang } from '@/lib/blog/schema';
import { getSnapshots } from '@/lib/blog/posts';
import { getBlogTranslations } from './i18n';
import PostSearch from './PostSearch';

interface BlogIndexProps {
  lang: Lang;
}

const BlogIndex = ({ lang }: BlogIndexProps) => {
  const t = getBlogTranslations(lang);
  const snapshots = getSnapshots(lang);

  return (
    <section className="relative px-6 py-30">
      <Container fullWidth>
        <FadeIn>
          <div className="mx-auto mb-16 max-w-300 text-center">
            <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
              {t('nav.blog')}
            </span>
            <Heading
              as="h1"
              className="font-display text-4xl md:text-6xl"
              content={t('nav.blog')}
            />
          </div>
        </FadeIn>
        <PostSearch lang={lang} snapshots={snapshots} />
      </Container>
    </section>
  );
};

export default BlogIndex;
