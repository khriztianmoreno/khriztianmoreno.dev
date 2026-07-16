import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import PostDetail from '@/components/blog/PostDetail';
import { decodeRouteParam, ogImageHref, postHref } from '@/components/blog/paths';
import { getAllSlugs, getPostBySlug } from '@/lib/blog/posts';
import { getDescFromMdString } from '@/lib/blog/markdown';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs('en').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeRouteParam(rawSlug);
  const post = getPostBySlug('en', slug);
  if (!post) return {};

  const description = post.data.description || getDescFromMdString(post.body);
  const ogImage = ogImageHref('en', slug);

  return {
    title: `${post.data.title} — Khriztian Moreno`,
    description,
    alternates: {
      canonical: postHref('en', slug),
      languages: {
        en: postHref('en', slug),
        es: postHref('es', slug),
      },
    },
    openGraph: {
      type: 'article',
      title: post.data.title,
      description,
      publishedTime: post.data.date.toISOString(),
      modifiedTime: post.data.updated?.toISOString(),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.data.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeRouteParam(rawSlug);
  const post = getPostBySlug('en', slug);

  if (!post) {
    notFound();
  }

  return <PostDetail lang="en" post={post} />;
}
