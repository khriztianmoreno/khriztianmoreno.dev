import { type Metadata } from 'next';

import TagsIndex from '@/components/blog/TagsIndex';

export const metadata: Metadata = {
  title: 'Tags — Khriztian Moreno',
  description: 'Browse all blog post tags.',
};

export default function TagsPage() {
  return <TagsIndex lang="en" />;
}
