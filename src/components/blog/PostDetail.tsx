import Link from 'next/link';

import Container from '@/components/common/UI/Container';
import FadeIn from '@/components/common/FadeIn';
import Heading from '@/components/common/Heading';
import { type Lang, type Post } from '@/lib/blog/schema';
import { getFormattedDate } from '@/lib/blog/date';
import { renderMarkdown } from '@/lib/blog/markdown';
import Comments from './Comments';
import { getBlogTranslations } from './i18n';
import { blogIndexHref, tagHref } from './paths';
import PostBody from './PostBody';
import TableOfContents from './TableOfContents';
import { getTagAccentClass } from './tagAccent';

interface PostDetailProps {
  lang: Lang;
  post: Post;
}

const PostDetail = async ({ lang, post }: PostDetailProps) => {
  const t = getBlogTranslations(lang);
  const { html, headings } = await renderMarkdown(post.body);
  const publishedDate = getFormattedDate(post.data.date);
  const updatedDate = post.data.updated
    ? getFormattedDate(post.data.updated)
    : undefined;

  return (
    <article className="relative px-6 py-30">
      <Container fullWidth>
        <div className="mx-auto grid max-w-200 grid-cols-1 gap-16 lg:max-w-full lg:grid-cols-[minmax(0,1fr)_260px]">
          <FadeIn className="lg:col-span-2">
            <div className="mb-12 max-w-200">
              <Link
                href={blogIndexHref(lang)}
                className="mb-8 inline-block font-mono text-sm uppercase tracking-widest text-primary hover:underline"
              >
                ← {t('backToBlog')}
              </Link>
              <Heading
                as="h1"
                className="bg-gradient-to-r from-on-surface to-secondary-light bg-clip-text text-3xl text-transparent md:text-5xl"
                content={post.data.title}
              />
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                <span>
                  {t('publishedAt')} {publishedDate}
                </span>
                {updatedDate && (
                  <span>
                    {t('updatedAt')} {updatedDate}
                  </span>
                )}
              </div>
              {post.data.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.data.tags.map((tag) => (
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
          </FadeIn>

          <FadeIn>
            <PostBody
              html={html}
              className="prose prose-invert max-w-200 prose-headings:font-display prose-a:text-primary prose-code:text-tertiary prose-pre:glass-card"
            />
            <Comments lang={lang} />
          </FadeIn>

          <TableOfContents headings={headings} eyebrow={t('tableOfContents')} />
        </div>
      </Container>
    </article>
  );
};

export default PostDetail;
