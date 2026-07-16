import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastToString } from 'mdast-util-to-string';
import { unified, type Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeGithubAlerts, type IOptions as GithubAlertsOptions } from 'rehype-github-alerts';
import rehypeMathjax from 'rehype-mathjax';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

/**
 * The excerpt delimiter markers, ported from the Astro source project's
 * `MISC.more.marks` (src/config.ts). Only the primary `<!--more-->` marker
 * is used for splitting; both are recognized as "has an explicit excerpt".
 */
export const MORE_MARKS = ['<!--more-->', '<!-- more -->'] as const;

/** One entry in a post's table of contents, built from its `h2`/`h3` headings. */
export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/**
 * Minimal shape we rely on for hast element/text nodes. We deliberately
 * avoid depending on the `hast`/`unist` type packages here since neither is
 * hoisted to the top-level `node_modules` under this project's pnpm layout
 * (only transitively pulled in by other rehype/remark plugins) — pulling
 * their types in directly would be relying on an implementation detail of
 * unrelated packages' dependency trees rather than a real dependency of
 * this file.
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
 * already assigned `id`s to headings) and pushes every `h2`/`h3` it finds
 * into `headings`, mutating the array captured in closure. This lets
 * `renderMarkdown` return the post's heading outline alongside the
 * rendered HTML without a second parse pass.
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
 * Renders a post's markdown body to HTML and, alongside it, the outline of
 * `h2`/`h3` headings (id + text + depth) used to build the desktop table of
 * contents. Uses the same plugin pipeline as the Astro source project's
 * `astro.config.mjs` markdown config: remark-parse -> remark-gfm ->
 * remark-math -> remark-rehype -> rehype-external-links ->
 * rehype-github-alerts -> rehype-mathjax -> rehype-stringify, plus
 * rehype-pretty-code (Shiki) for code-block syntax highlighting — ported
 * from Astro's built-in `markdown.shikiConfig` (`{ theme: "dracula", wrap:
 * true }`), which the old remark/rehype-only pipeline above never
 * replicated. `rehype-slug` assigns `id`s to headings so the table of
 * contents can link to them; `rehypeCollectHeadings` then walks the
 * resulting tree once to collect those headings into `headings`.
 *
 * rehype-pretty-code is placed immediately after remark-rehype, before the
 * other rehype plugins: it needs to run on the raw `pre > code` text nodes
 * that remark-rehype produces, and it replaces each code block's subtree
 * with Shiki's per-line/per-token span structure. Neither
 * rehype-external-links (operates on `<a>` nodes) nor rehype-github-alerts
 * (operates on alert `<blockquote>`s) touch code blocks, so their ordering
 * relative to rehype-pretty-code doesn't matter functionally — they're kept
 * after it so the tree rehype-pretty-code sees is as close as possible to
 * remark-rehype's direct output. `rehype-slug`/`rehypeCollectHeadings` only
 * touch headings, so their position relative to rehype-pretty-code is
 * likewise inconsequential; they run right after remark-rehype for clarity.
 */
export async function renderMarkdown(
  body: string,
): Promise<{ html: string; headings: TocHeading[] }> {
  const headings: TocHeading[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeCollectHeadings(headings))
    .use(rehypePrettyCode, {
      theme: 'dracula',
      keepBackground: false,
    })
    .use(rehypeExternalLinks)
    // rehype-github-alerts' TS types require an options object even though
    // the runtime merges it with full defaults (all 5 GitHub alert kinds)
    // when omitted — matching Astro's zero-arg `rehypeGithubAlerts` call.
    .use(rehypeGithubAlerts, {} as GithubAlertsOptions)
    .use(rehypeMathjax)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(body);

  return { html: String(file), headings };
}

const EXCERPT_FALLBACK_LENGTH = 200;

/**
 * Extracts the excerpt from a raw markdown string, up to the `<!--more-->`
 * marker — ported from the Astro source project's
 * `src/utils/markdown.ts#getDescFromMdString`, using the same
 * mdast-util-from-markdown + mdast-util-to-string approach to strip
 * markdown syntax down to plain text.
 *
 * Astro's original does `desc.slice(0, desc.indexOf("<!--more-->"))`
 * unconditionally, which silently drops the last character of the whole
 * description when no marker is present (`indexOf` returns -1). All 128
 * ported posts do include the marker, so this never fired in practice, but
 * it's a latent bug — here we fall back to a sensible truncation instead.
 */
export function getDescFromMdString(mdString: string): string {
  const mdast = fromMarkdown(mdString);
  const desc = mdastToString(mdast);
  const pos = desc.indexOf('<!--more-->');
  if (pos !== -1) {
    return desc.slice(0, pos);
  }
  const trimmed = desc.trim();
  if (trimmed.length <= EXCERPT_FALLBACK_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, EXCERPT_FALLBACK_LENGTH).trimEnd()}…`;
}
