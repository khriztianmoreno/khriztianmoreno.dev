

# khriztianmoreno web site

> A Very khriztianmoreno Website — Javascript Developer 👨🏼‍💻🇨🇴💻

<p align="center">
  <img alt="A Very khriztianmoreno Website" src="https://res.cloudinary.com/khriztianmoreno/image/upload/v1623084556/km_site/preview.gif" width="80%" />
</p>

## Build Setup

``` bash
# install dependencies
$ pnpm install

# serve with hot reload at localhost:3000
$ pnpm dev

# build for production and launch server
$ pnpm build
$ pnpm start
```

For detailed explanation on how things work, checkout the [Next.js docs](https://nextjs.org/docs/getting-started).

## ✍️ New blog post

Scaffold a new post under `content/posts/<lang>/<slug>.mdx` with `pnpm new`:

``` bash
# creates content/posts/en/hello-world.mdx
$ pnpm new "Hello World"

# creates content/posts/es/hola-mundo.mdx
$ pnpm new -l es "Hola, Mundo"

# draft, goes to content/drafts/<lang>/ instead
$ pnpm new -d "Work in progress"
```

Options:

| Flag | Description | Default |
| --- | --- | --- |
| `-l, --lang <en\|es>` | Post language | `en` |
| `-d, --draft` | Write to `content/drafts/` instead of `content/posts/` | `false` |
| `-h, --help` | Show usage | — |

The slug is derived from the title via `slugify`. The generated file already has the frontmatter this repo's schema expects (`title`, `tags`, `date`, `updated`) — fill in the tags and content, then remove the placeholder text.

### MDX notes

Posts are MDX, rendered with `next-mdx-remote-client` (see `src/lib/blog/mdx.tsx`):

- The excerpt marker is `{/* more */}`. HTML comments (`<!-- -->`) are a syntax error in MDX.
- Raw HTML is JSX: use `className`, camelCase attributes (`allowFullScreen`, `frameBorder`), self-close void tags (`<br />`), and pass `style` as an object (`style={{ width: '100%' }}`).
- A literal `{`, `}` or `<` in prose must go in inline code or be escaped (`\{`, `&lt;`).
- To use a React component in a post, register it in `src/components/blog/mdx-components.tsx` and write `<MyDemo />` in the `.mdx`. Interactive components need `'use client'`. Cross-posted copies (dev.to, Hashnode) get plain markdown, so components don't render there.

## 💫 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkhriztianmoreno%2Fkhriztianmoreno.dev)
