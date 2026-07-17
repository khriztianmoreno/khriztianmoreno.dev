import { type Metadata } from 'next';

import TagPosts from '@/components/blog/TagPosts';
import { decodeRouteParam } from '@/components/blog/paths';
import { getAllTags } from '@/lib/blog/posts';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return Array.from(getAllTags('en').keys()).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeRouteParam(rawTag);
  return {
    title: `#${tag} — Khriztian Moreno`,
    description: `Posts tagged with #${tag}.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeRouteParam(rawTag);
  return <TagPosts lang="en" tag={tag} />;
}
