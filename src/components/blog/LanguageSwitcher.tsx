'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type Lang } from '@/lib/blog/schema';

const FLAGS: Record<Lang, { emoji: string; label: string }> = {
  en: { emoji: '🇺🇸', label: 'English' },
  es: { emoji: '🇨🇴', label: 'Español' },
};

const LANGS: Lang[] = ['en', 'es'];

/**
 * Swaps the `/es` prefix in/out of the current blog pathname to get the
 * equivalent page in the other language. Safe because every post is
 * ported under the same slug in both `content/posts/en/` and
 * `content/posts/es/` (verified 1:1 at migration time) — see
 * `src/components/blog/paths.ts` for the same `/es` prefix convention
 * used to build hrefs elsewhere.
 */
function pathForLang(pathname: string, lang: Lang): string {
  const isSpanish = pathname === '/es/blog' || pathname.startsWith('/es/blog/');
  if (lang === 'es') {
    return isSpanish ? pathname : `/es${pathname}`;
  }
  return isSpanish ? pathname.slice('/es'.length) || '/blog' : pathname;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLang: Lang = pathname.startsWith('/es') ? 'es' : 'en';

  return (
    <div className="flex items-center gap-2" aria-label="Language">
      {LANGS.map((lang) => {
        const isActive = lang === currentLang;
        return (
          <Link
            key={lang}
            href={pathForLang(pathname, lang)}
            aria-label={FLAGS[lang].label}
            aria-current={isActive || undefined}
            title={FLAGS[lang].label}
            className={`text-xl leading-none transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'
            }`}
          >
            {FLAGS[lang].emoji}
          </Link>
        );
      })}
    </div>
  );
}
