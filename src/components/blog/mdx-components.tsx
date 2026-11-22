import type { ComponentPropsWithoutRef } from 'react';
import type { MDXComponents } from 'next-mdx-remote-client/rsc';

import CodeWindow from './CodeWindow';

type FigureProps = ComponentPropsWithoutRef<'figure'> & {
  'data-rehype-pretty-code-figure'?: string;
};

/**
 * Components available to every post's MDX.
 *
 * - HTML element overrides (lowercase keys) restyle standard markup, e.g.
 *   code blocks get the macOS window chrome.
 * - Custom components (PascalCase keys) can be used directly in a post:
 *   register them here, then write `<MyDemo prop="x" />` in the `.mdx`.
 *   Interactive ones need `'use client'` in their own file.
 */
export const mdxComponents: MDXComponents = {
  figure: (props: FigureProps) =>
    props['data-rehype-pretty-code-figure'] !== undefined ? (
      <CodeWindow {...props} />
    ) : (
      <figure {...props} />
    ),
};
