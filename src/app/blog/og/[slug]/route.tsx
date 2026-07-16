import { decodeRouteParam } from '@/components/blog/paths';
import { generateOgImage } from '@/lib/blog/og-image';
import { getAllSlugs, getPostBySlug } from '@/lib/blog/posts';

export function generateStaticParams() {
  return getAllSlugs('en').map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = decodeRouteParam(rawSlug);
  const post = getPostBySlug('en', slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  return generateOgImage({
    title: post.data.title,
    date: post.data.updated ?? post.data.date,
    tags: post.data.tags,
  });
}
