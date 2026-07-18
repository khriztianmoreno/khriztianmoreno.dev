/**
 * Accent classes rotated across labels, keyed by label text (not list
 * position) — so a given label always renders in the same color everywhere
 * it appears, instead of shifting color depending on which slot it happens
 * to occupy in a given list.
 */
const ACCENT_CLASSES = [
  'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
  'border-secondary-light/30 bg-secondary-light/10 text-secondary-light hover:bg-secondary-light/20',
  'border-tertiary/30 bg-tertiary/10 text-tertiary hover:bg-tertiary/20',
  'border-quaternary/30 bg-quaternary/10 text-quaternary hover:bg-quaternary/20',
];

/** Deterministic (non-cryptographic) string hash — same input always
 * yields the same output, on both server and client, which is all that's
 * needed to pick a stable color bucket per label. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getAccentClass(label: string): string {
  return ACCENT_CLASSES[hashString(label) % ACCENT_CLASSES.length];
}
