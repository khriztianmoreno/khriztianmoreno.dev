import type { CSSProperties } from 'react';
import type { ThemeName } from '../types';

// Terminal palettes exposed as CSS custom properties scoped to the terminal
// window. Components consume them through Tailwind arbitrary-value classes
// such as `text-(--t-accent)` so the `theme` command can swap palettes
// without touching the rest of the page.
//
// Dark mode reuses the site's design tokens; light mode keeps the original
// Warp-inspired light palette from khriztianmoreno.com.
type ThemeVars = CSSProperties & Record<`--t-${string}`, string>;

export const THEMES: Record<ThemeName, ThemeVars> = {
  dark: {
    '--t-panel': '#000000',
    '--t-border': 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
    '--t-chip': 'var(--color-surface-container)',
    '--t-chip-border': 'var(--color-surface-container-high)',
    '--t-text': 'var(--color-on-surface-variant)',
    '--t-bright': 'var(--color-on-surface)',
    '--t-dim': 'var(--color-outline)',
    '--t-accent': 'var(--color-quaternary)',
    '--t-green': 'var(--color-primary)',
    '--t-amber': '#fbbf24',
    '--t-pink': 'var(--color-tertiary)',
    '--t-red': '#fb7185',
    '--t-track': 'var(--color-surface-container-high)',
    '--t-hover': 'var(--color-surface-container)',
  },
  light: {
    '--t-panel': '#fbfcfd',
    '--t-border': '#d6dbe2',
    '--t-chip': '#eef1f5',
    '--t-chip-border': '#d6dbe2',
    '--t-text': '#3a4452',
    '--t-bright': '#10151d',
    '--t-dim': '#6b7483',
    '--t-accent': '#0284c7',
    '--t-green': '#3f8f1f',
    '--t-amber': '#b45309',
    '--t-pink': '#a21caf',
    '--t-red': '#dc2626',
    '--t-track': '#dde1e8',
    '--t-hover': '#e7eaef',
  },
};
