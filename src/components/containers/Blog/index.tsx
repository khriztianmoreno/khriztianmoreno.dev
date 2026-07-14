import FadeIn from '../../common/FadeIn';
import { BLOG_POSTS } from '@/data/blog';

const BlogSection = () => (
  <section id="blog_section" className="relative px-6 py-30">
    <div className="mx-auto mb-16 max-w-300 text-center">
      <span className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-primary">
        Writing
      </span>
      <h2 className="font-display text-4xl md:text-6xl">Latest Articles</h2>
    </div>

    {BLOG_POSTS.length > 0 ? (
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post, index) => (
          <FadeIn key={post.url} delay={(index % 3) * 0.1}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card block h-full p-8 transition-all hover:border-primary/40 hover:shadow-neon"
            >
              <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-primary">
                {post.displayDate}
              </span>
              <h3 className="mb-3 text-lg font-bold leading-snug">
                {post.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {post.description}
              </p>
            </a>
          </FadeIn>
        ))}
      </div>
    ) : (
      <p className="mx-auto max-w-md text-center text-on-surface-variant">
        New articles are on their way — check{' '}
        <a
          href="https://blog.khriztianmoreno.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          the blog
        </a>{' '}
        directly in the meantime.
      </p>
    )}
  </section>
);

export default BlogSection;
