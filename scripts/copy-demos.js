/**
 * Copies `demos/<name>/` to `public/demos/<name>/` so the blog can embed the
 * live demos (via the `<LiveDemo>` MDX component) from the same origin.
 *
 * `demos/` stays the source of truth; `public/demos/` is a build artifact
 * (gitignored) regenerated before every `dev` and `build`. Run explicitly
 * from the npm scripts rather than as `pre*` hooks, since pnpm skips
 * pre/post scripts by default.
 */

const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(process.cwd(), 'demos');
const DEST = path.join(process.cwd(), 'public', 'demos');

fs.rmSync(DEST, { recursive: true, force: true });

if (fs.existsSync(SRC)) {
  fs.cpSync(SRC, DEST, { recursive: true });
  const names = fs
    .readdirSync(DEST, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  console.log(`copy-demos: ${names.length} demo(s) -> public/demos/ (${names.join(', ')})`);
}
