import { type Lang } from '@/lib/blog/schema';

/**
 * Small UI-copy dictionary for the blog routes, ported from the Astro
 * source project's `src/utils/i18n.ts` `ui` table, trimmed to the strings
 * the App Router blog pages actually render.
 */
export const blogUi = {
  en: {
    'nav.blog': 'Blog',
    'nav.tags': 'Tags',
    'nav.back': 'Back',
    'search.placeholder': 'Search posts...',
    'search.noResults': 'No results found',
    postsWithTag: 'Posts with tag',
    allTags: 'All tags',
    publishedAt: 'Published',
    updatedAt: 'Updated',
    backToBlog: 'Back to blog',
    backToTags: 'Back to tags',
    tableOfContents: 'In this guide',
  },
  es: {
    'nav.blog': 'Blog',
    'nav.tags': 'Etiquetas',
    'nav.back': 'Volver',
    'search.placeholder': 'Buscar posts...',
    'search.noResults': 'No se encontraron resultados',
    postsWithTag: 'Posts con la etiqueta',
    allTags: 'Todas las etiquetas',
    publishedAt: 'Publicado',
    updatedAt: 'Actualizado',
    backToBlog: 'Volver al blog',
    backToTags: 'Volver a etiquetas',
    tableOfContents: 'En esta guía',
  },
} as const;

type BlogUiKey = keyof (typeof blogUi)['en'];

export function getBlogTranslations(lang: Lang) {
  return function t(key: BlogUiKey): string {
    return blogUi[lang][key] ?? blogUi.en[key];
  };
}
