'use client';

import { useRef, useState, type ComponentPropsWithoutRef } from 'react';

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const COPIED_RESET_MS = 1500;

type CodeWindowProps = ComponentPropsWithoutRef<'figure'> & {
  'data-language'?: string;
};

/**
 * macOS-style window chrome (traffic-light dots, language label, copy
 * button) around a rehype-pretty-code `<figure>`. Mapped to `figure` in
 * `mdxComponents`, so it renders as part of the React tree instead of the
 * old post-mount DOM surgery `PostBody` did on `dangerouslySetInnerHTML`
 * output. Keeps the same class names, so the `.code-window*` styles in
 * `globals.css` apply unchanged.
 */
export default function CodeWindow({ children, ...figureProps }: CodeWindowProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const language = figureProps['data-language'] ?? '';

  const handleCopy = () => {
    const code = figureRef.current?.querySelector('pre')?.innerText ?? '';
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    });
  };

  return (
    <div className="code-window">
      <div className="code-window-titlebar">
        <div className="code-window-dots">
          <span className="code-window-dot code-window-dot-red" />
          <span className="code-window-dot code-window-dot-yellow" />
          <span className="code-window-dot code-window-dot-green" />
        </div>
        <span className="code-window-lang">{language}</span>
        <button type="button" className="code-window-copy" onClick={handleCopy}>
          {copied ? COPIED_LABEL : COPY_LABEL}
        </button>
      </div>
      <figure ref={figureRef} {...figureProps}>
        {children}
      </figure>
    </div>
  );
}
