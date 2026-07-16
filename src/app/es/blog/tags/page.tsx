import { type Metadata } from 'next';

import TagsIndex from '@/components/blog/TagsIndex';

export const metadata: Metadata = {
  title: 'Etiquetas — Khriztian Moreno',
  description: 'Explora todas las etiquetas del blog.',
};

export default function TagsPageEs() {
  return <TagsIndex lang="es" />;
}
