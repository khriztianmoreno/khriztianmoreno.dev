'use client';

import { useEffect, useRef } from 'react';

interface PostBodyProps {
  html: string;
  className?: string;
}

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const COPIED_RESET_MS = 1500;

/**
 * Renders the post's server-rendered HTML, then progressively enhances every
 * rehype-pretty-code figure with a macOS-style window chrome (traffic-light
 * dots, language label, copy button) after mount. This stays DOM-imperative
 * rather than React-rendered because the code HTML itself is opaque markup
 * from `dangerouslySetInnerHTML` — same approach the source Astro project
 * used (`markdown-post.astro`'s inline `<script>`), ported to a client
 * component instead of a raw script tag.
 */
export default function PostBody({ html, className }: PostBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const figures = container.querySelectorAll<HTMLElement>(
      '[data-rehype-pretty-code-figure]'
    );

    figures.forEach((figure) => {
      // Guards against double-wrapping on React Strict Mode's dev
      // double-invoke of effects (the DOM nodes persist across both runs
      // since they come from dangerouslySetInnerHTML, not React state).
      if (figure.dataset.windowEnhanced === 'true') return;
      figure.dataset.windowEnhanced = 'true';

      const pre = figure.querySelector('pre');
      const language = pre?.getAttribute('data-language') ?? '';

      const windowEl = document.createElement('div');
      windowEl.className = 'code-window';

      const titlebar = document.createElement('div');
      titlebar.className = 'code-window-titlebar';

      const dots = document.createElement('div');
      dots.className = 'code-window-dots';
      dots.innerHTML =
        '<span class="code-window-dot code-window-dot-red"></span>' +
        '<span class="code-window-dot code-window-dot-yellow"></span>' +
        '<span class="code-window-dot code-window-dot-green"></span>';

      const label = document.createElement('span');
      label.className = 'code-window-lang';
      label.textContent = language;

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'code-window-copy';
      copyButton.textContent = COPY_LABEL;
      copyButton.addEventListener('click', () => {
        const code = pre?.innerText ?? '';
        navigator.clipboard.writeText(code).then(() => {
          copyButton.textContent = COPIED_LABEL;
          setTimeout(() => {
            copyButton.textContent = COPY_LABEL;
          }, COPIED_RESET_MS);
        });
      });

      titlebar.append(dots, label, copyButton);

      figure.parentElement?.insertBefore(windowEl, figure);
      windowEl.append(titlebar, figure);
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
