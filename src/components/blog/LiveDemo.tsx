'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface LiveDemoProps {
  /** Folder name under `demos/` (served from `/demos/<name>/`). */
  name: string;
  /** Accessible title for the iframe. */
  title: string;
  /** Caption shown under the frame. */
  caption?: string;
  /** Label of the "open in a new tab" link. */
  openLabel?: string;
  /** Height before the demo reports its own (and if it never does). */
  initialHeight?: number;
}

/**
 * Embeds one of the repo's vanilla demos (`demos/<name>/index.html`, copied
 * to `public/demos/` by `scripts/copy-demos.js`) as a live iframe.
 *
 * The demo is served from the same origin, so the frame can read its
 * document and grow to fit the content instead of showing a second
 * scrollbar. It measures the bottom of the body's children rather than
 * `scrollHeight`, because demos use `min-h-screen`, which would tie the
 * document's height to the frame's and only ever let it grow. It re-attaches
 * on every load, so in-frame navigation (`?nojs`, `submitted.html`) also
 * resizes.
 */
export default function LiveDemo({
  name,
  title,
  caption,
  openLabel = 'Open in a new tab',
  initialHeight = 900,
}: LiveDemoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(initialHeight);
  const src = `/demos/${encodeURIComponent(name)}/index.html`;

  const attach = useCallback(() => {
    observerRef.current?.disconnect();
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;

    const measure = () => {
      const { body } = doc;
      const scrollY = doc.defaultView?.scrollY ?? 0;
      const paddingBottom = parseFloat(getComputedStyle(body).paddingBottom) || 0;
      const bottom = Math.max(
        0,
        ...Array.from(body.children).map((el) => {
          const marginBottom = parseFloat(getComputedStyle(el).marginBottom) || 0;
          return el.getBoundingClientRect().bottom + scrollY + marginBottom;
        })
      );
      if (bottom > 0) setHeight(Math.ceil(bottom + paddingBottom));
    };

    const observer = new ResizeObserver(measure);
    Array.from(doc.body.children).forEach((el) => observer.observe(el));
    observerRef.current = observer;
    measure();
  }, []);

  useEffect(() => {
    // The frame may finish loading before hydration, in which case React
    // never sees its `load` event.
    if (iframeRef.current?.contentDocument?.readyState === 'complete') attach();
    return () => observerRef.current?.disconnect();
  }, [attach]);

  return (
    <figure className="not-prose my-10">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          onLoad={attach}
          loading="lazy"
          className="block w-full border-0"
          style={{ height }}
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm text-on-surface-variant">
        {caption && <span>{caption}</span>}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-primary hover:underline"
        >
          {openLabel} ↗
        </a>
      </figcaption>
    </figure>
  );
}
