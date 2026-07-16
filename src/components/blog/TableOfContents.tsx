'use client';

import { useEffect, useRef, useState } from 'react';

import { type TocHeading } from '@/lib/blog/markdown';

interface TableOfContentsProps {
  headings: TocHeading[];
  eyebrow: string;
}

/**
 * Sticky desktop table of contents for a blog post, rendered alongside the
 * prose body at `lg:` and up (hidden below that breakpoint — mobile keeps
 * the single-column layout). Highlights the heading currently in view via
 * `IntersectionObserver` scroll-spy.
 *
 * `top-28` accounts for the site's fixed `.portfolio_navbar` (24px vertical
 * padding + logo, shrinking to 14px once `sticky-nav-active` kicks in) plus
 * breathing room, matching the `scroll-margin-top` values already used
 * elsewhere on the site (e.g. `#me_bio` at 90px in globals.css).
 */
const TableOfContents = ({ headings, eyebrow }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const headingsRef = useRef(headings);
  headingsRef.current = headings;

  useEffect(() => {
    if (headingsRef.current.length === 0) {
      return undefined;
    }

    const elements = headingsRef.current
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-96px 0px -70% 0px',
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="post-toc sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pl-1 lg:block">
      <p className="mb-3.5 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
        {eyebrow}
      </p>
      <ol className="flex flex-col gap-0.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={activeId === heading.id ? 'is-active' : undefined}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1.5 text-sm leading-snug text-on-surface-variant transition-colors hover:text-on-surface ${
                heading.depth === 3 ? 'pl-8' : 'pl-4'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
};

export default TableOfContents;
