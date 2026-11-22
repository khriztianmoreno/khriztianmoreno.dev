import { evaluate } from 'next-mdx-remote-client/rsc';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeGithubAlerts, type IOptions as GithubAlertsOptions } from 'rehype-github-alerts';
import rehypeMathjax from 'rehype-mathjax';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';

import { mdxComponents } from '@/components/blog/mdx-components';
import type { TocHeading } from './markdown';

/**
 * Minimal shape we rely on for hast element/text nodes. We deliberately
 * avoid depending on the `hast`/`unist` type packages here since neither is
 * hoisted to the top-level `node_modules` under this project's pnpm layout
 * (only transitively pulled in by other rehype/remark plugins).
 */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function hastNodeToText(node: HastNode): string {
  if (node.type === 'text') {
    return node.value ?? '';
  }
  return (node.children ?? []).map(hastNodeToText).join('');
}

/**
 * Rehype plugin factory: walks the hast tree (after `rehype-slug` has
 * assigned `id`s to headings) and pushes every `h2`/`h3` into `headings`,
 * mutating the array captured in closure. This lets `renderPost` return the
 * heading outline alongside the rendered content without a second parse.
 */
function rehypeCollectHeadings(headings: TocHeading[]): Plugin {
  return () => (tree) => {
    visit(tree as HastNode, (node: HastNode) => {
      if (node.type !== 'element') return;
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
      const id = node.properties?.id;
      if (typeof id !== 'string' || id.length === 0) return;
      headings.push({
        id,
        text: hastNodeToText(node),
        depth: node.tagName === 'h2' ? 2 : 3,
      });
    });
  };
}

/**
 * rehype-pretty-code puts `data-language` on the `<pre>`/`<code>`, not on
 * the wrapping `<figure>`. Copying it up lets the `figure` MDX component
 * (`CodeWindow`) label its title bar from props instead of reading the DOM.
 */
const rehypeFigureLanguage: Plugin = () => (tree) => {
  visit(tree as HastNode, (node: HastNode) => {
    if (node.type !== 'element' || node.tagName !== 'figure') return;
    // rehype-pretty-code writes raw `data-*` keys rather than hast's
    // camelCase property names, so read and write them the same way.
    if (node.properties?.['data-rehype-pretty-code-figure'] === undefined) return;
    const pre = node.children?.find(
      (child) => child.type === 'element' && child.tagName === 'pre'
    );
    const language = pre?.properties?.['data-language'];
    if (typeof language === 'string') {
      node.properties['data-language'] = language;
    }
  });
};

/**
 * Compiles and evaluates a post's MDX body into a React Server Component
 * tree, plus the outline of `h2`/`h3` headings for the table of contents.
 *
 * Same remark/rehype pipeline the markdown era used (GFM, math, slugs,
 * Shiki via rehype-pretty-code with the dracula theme, external links,
 * GitHub alerts, MathJax), now run by the MDX compiler so posts can embed
 * React components from `mdxComponents`.
 *
 * Compilation errors are thrown rather than rendered: posts are statically
 * generated, so a broken post fails the build instead of shipping an error
 * box to readers.
 */
export async function renderPost(
  source: string
): Promise<{ content: React.JSX.Element; headings: TocHeading[] }> {
  const headings: TocHeading[] = [];

  const { content, error } = await evaluate({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          rehypeCollectHeadings(headings),
          [rehypePrettyCode, { theme: 'dracula', keepBackground: false }],
          rehypeFigureLanguage,
          rehypeExternalLinks,
          // rehype-github-alerts' TS types require an options object even
          // though the runtime falls back to full defaults when omitted.
          [rehypeGithubAlerts, {} as GithubAlertsOptions],
          rehypeMathjax,
        ],
      },
    },
  });

  if (error) {
    throw error;
  }

  return { content, headings };
}
