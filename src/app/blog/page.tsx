import { type Metadata } from 'next';

import BlogIndex from '@/components/blog/BlogIndex';

export const metadata: Metadata = {
  title: 'Blog — Khriztian Moreno',
  description:
    'Articles on web performance, React, JavaScript, and full stack engineering by Khriztian Moreno.',
  alternates: {
    languages: {
      en: '/blog',
      es: '/es/blog',
    },
  },
};

export default function BlogPage() {
  return <BlogIndex lang="en" />;
}
