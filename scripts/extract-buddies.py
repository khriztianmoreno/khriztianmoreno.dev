"""
Cuts the six reading buddies out of the character sheet (a 3x2 grid on a
pure-black background) into transparent WebP files for public/buddies/.

    python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy
    .venv/bin/python scripts/extract-buddies.py <sheet.png> public/buddies

Also writes preview-<name>.png (on the site's purple and on white) next to
the output, to check for fringes; delete those before committing.
"""
import sys
from PIL import Image
import numpy as np
from scipy import ndimage


def closing(mask, radius):
    yy, xx = np.mgrid[-radius:radius + 1, -radius:radius + 1]
    disk = (xx**2 + yy**2) <= radius**2
    padded = np.pad(mask, radius)
    return ndimage.binary_closing(padded, structure=disk)[radius:-radius, radius:-radius]


def largest(mask, keep_ratio=None):
    """Largest blob, or every blob at least `keep_ratio` times its size."""
    labels, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = ndimage.sum(mask, labels, range(1, n + 1))
    if keep_ratio is None:
        return labels == (np.argmax(sizes) + 1)
    keep = np.flatnonzero(sizes >= keep_ratio * sizes.max()) + 1
    return np.isin(labels, keep)


src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
# Closing radius per character: seals the clothes' dark folds and edges.
# Icons are split off first, so the radius can't glue them onto the body.
RADIUS = {'cool': 10, 'dance': 10, 'laptop': 10, 'question': 7, 'star': 10, 'chill': 7}
names = [['cool', 'dance', 'laptop'], ['question', 'star', 'chill']]
row_edges = [0, 560, H]
# The star's burst lines cross the grid line into the question cell.
LEFT_OVERLAP = {'star': 45}
col_edges = [0, 512, 1024, W]

for r in range(2):
    for c in range(3):
        R = RADIUS[names[r][c]]
        x0 = col_edges[c] - LEFT_OVERLAP.get(names[r][c], 0)
        cell = im[row_edges[r]:row_edges[r+1], x0:col_edges[c+1]]
        bright = cell.max(2)
        # Soft alpha from brightness: the background is pure black, so glows,
        # the ground shadow and the floating icons fade out naturally.
        soft = np.clip((bright - 6) / 34, 0, 1)
        # The character's black clothes and visor would vanish with that alone,
        # so build a solid silhouette from everything brighter than the
        # backdrop (0-2; the "black" clothes are ~25, with folds near 0):
        #  1. a small closing groups the body's big blobs (head, clothes,
        #     shoes) and leaves the floating icons (crown, bulb, </>) out;
        #  2. a closing on the body's pixels only (radius R) seals the folds
        #     and dark edges without gluing any icon onto the body;
        #  3. fill the remaining holes (visor, clothes).
        ink = bright > 10
        main = largest(closing(ink, 7), keep_ratio=0.12)
        body = ndimage.binary_fill_holes(largest(closing(ink & main, R)))
        body = ndimage.gaussian_filter(body.astype(np.float32), 0.8)
        alpha = np.maximum(soft, body)
        # Drop small pieces touching the cell's edge: slivers of the
        # neighbouring characters that spill over the grid lines.
        # Only small pieces: a faint glow can connect the character itself to
        # the edge, and that must stay.
        labels, n = ndimage.label(alpha > 0.02)
        sizes = ndimage.sum(np.ones_like(alpha), labels, range(1, n + 1))
        edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
        small = [l for l in edge if l > 0 and sizes[l - 1] < 0.2 * sizes.max()]
        alpha[np.isin(labels, small)] = 0
        # Un-premultiply against black for the partially transparent pixels.
        rgb = cell.copy()
        partial = (alpha > 0) & (alpha < 1)
        rgb[partial] = np.clip(cell[partial] / alpha[partial, None], 0, 255)
        rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
        ys, xs = np.where(alpha > 0.05)
        pad = 8
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, rgba.shape[0])
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, rgba.shape[1])
        crop = Image.fromarray(rgba[y0:y1, x0:x1])
        crop.thumbnail((400, 400), Image.LANCZOS)
        name = names[r][c]
        crop.save(f'{out}/{name}.webp', 'WEBP', quality=88, method=6)
        # Preview on the site's dark purple and on white, to spot fringes.
        prev = Image.new('RGBA', (crop.width * 2, crop.height), (24, 14, 48, 255))
        prev.paste(Image.new('RGBA', crop.size, (255, 255, 255, 255)), (crop.width, 0))
        prev.alpha_composite(crop, (0, 0)); prev.alpha_composite(crop, (crop.width, 0))
        prev.save(f'{out}/preview-{name}.png')
        print(name, crop.size)
