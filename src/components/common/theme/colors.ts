/**
 * Mirrored 1:1 from the `@theme` block in `src/styles/globals.css`.
 * Keep this file in sync — no drift allowed between the two (Theme Token Parity).
 */
const colors = {
  // Breakpoints
  breakpointSm: '576px',
  breakpointMd: '768px',
  breakpointLg: '991px',
  breakpointXl: '1220px',

  // Brand colors
  background: '#120b1e',
  surface: '#120b1e',
  surfaceDeep: '#03022D',
  surfaceDim: '#0c0814',
  surfaceContainer: '#1a1228',
  surfaceContainerHigh: '#231835',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#ccc3d6',
  outline: '#958da0',
  primary: '#00F59B',
  onPrimary: '#003920',
  secondary: '#6024C1',
  onSecondary: '#ffffff',
  // Lighter tint of `secondary` for foreground text/border use — see the
  // matching comment in globals.css's @theme block (Theme Token Parity).
  secondaryLight: '#a78bfa',
  tertiary: '#ff7edb',
  quaternary: '#7dd3fc',
  neonGreen: '#00F59B',
  electricPurple: '#6024C1',
  textMuted: 'rgba(255,255,255,0.7)',

  // Typography
  fontDisplay: "'Raleway', sans-serif",
  fontBody: "'Open Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",

  textDisplayLg: '64px',
  textDisplayLgLineHeight: '72px',
  textDisplayLgLetterSpacing: '-0.02em',
  textDisplayLgFontWeight: '800',

  textHeadlineLg: '40px',
  textHeadlineLgLineHeight: '48px',
  textHeadlineLgFontWeight: '700',

  textHeadlineMd: '24px',
  textHeadlineMdLineHeight: '32px',
  textHeadlineMdFontWeight: '600',

  textBodyLg: '18px',
  textBodyLgLineHeight: '28px',

  textBodyMd: '16px',
  textBodyMdLineHeight: '24px',

  textLabelMd: '14px',
  textLabelMdLineHeight: '20px',
  textLabelMdLetterSpacing: '0.05em',
  textLabelMdFontWeight: '500',

  textLabelSm: '12px',
  textLabelSmLineHeight: '16px',
  textLabelSmFontWeight: '500',

  // Spacing & shape
  spacingSection: '120px',
  spacingGutter: '24px',
  radiusCard: '0.75rem',
  shadowNeon: '0 0 20px rgba(0,245,155,0.4)',
} as const;

export type Colors = typeof colors;
export default colors;
