import { ImageResponse } from 'next/og';

import { formatDateForOg } from './date';

export interface OgImageOptions {
  title: string;
  date: Date | string;
  tags?: string[];
}

// Mirrors the --color-* tokens from src/styles/globals.css (@theme block).
const colors = {
  background: '#120b1e',
  surfaceDeep: '#03022D',
  surfaceContainer: '#1a1228',
  surfaceContainerHigh: '#231835',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#ccc3d6',
  outline: '#958da0',
  primary: '#00F59B',
  onPrimary: '#003920',
  secondary: '#6024C1',
};

const RALEWAY_BOLD =
  'https://cdn.jsdelivr.net/npm/@fontsource/raleway@5.0.8/files/raleway-latin-700-normal.woff';
const RALEWAY_BLACK =
  'https://cdn.jsdelivr.net/npm/@fontsource/raleway@5.0.8/files/raleway-latin-800-normal.woff';

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

/**
 * Generates the 1200x630 Open Graph card for a post, using Next's built-in
 * `next/og` (`ImageResponse`, backed by satori) instead of hand-rolled
 * satori + @resvg/resvg-js like the Astro source project did. Visual design
 * is restyled to this site's glass-card / neon-green design system, taken
 * from `src/styles/globals.css`'s `@theme` tokens, in place of Astro's
 * Dracula theme.
 */
export async function generateOgImage({
  title,
  date,
  tags = [],
}: OgImageOptions): Promise<ImageResponse> {
  const displayTags = tags.slice(0, 3);
  const formattedDate = formatDateForOg(typeof date === 'string' ? new Date(date) : date);
  const titleFontSize = title.length > 60 ? 42 : title.length > 40 ? 48 : 56;

  const [ralewayBold, ralewayBlack] = await Promise.all([
    loadFont(RALEWAY_BOLD),
    loadFont(RALEWAY_BLACK),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: `radial-gradient(circle at 50% 0%, ${colors.secondary}55 0%, transparent 45%), linear-gradient(180deg, ${colors.background} 0%, ${colors.surfaceDeep} 60%, #000000 100%)`,
          fontFamily: 'Raleway',
        }}
      >
        {/* Top section with brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '28px',
            fontWeight: 800,
            color: colors.primary,
            letterSpacing: '-0.5px',
          }}
        >
          khriztianmoreno
        </div>

        {/* Main content - Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            justifyContent: 'center',
            paddingRight: '40px',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: `${titleFontSize}px`,
              fontWeight: 800,
              color: colors.onSurface,
              lineHeight: 1.2,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {displayTags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: `${colors.primary}1a`,
                    border: `1px solid ${colors.primary}60`,
                    color: colors.primary,
                    fontSize: '16px',
                    fontWeight: 700,
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom section - glass card with date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${colors.outline}40`,
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '16px',
              fontWeight: 700,
              color: colors.onSurfaceVariant,
            }}
          >
            khriztianmoreno.dev
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: colors.surfaceContainer,
              border: `1px solid ${colors.surfaceContainerHigh}`,
              color: colors.primary,
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {formattedDate}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Raleway',
          data: ralewayBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Raleway',
          data: ralewayBlack,
          weight: 800,
          style: 'normal',
        },
      ],
    }
  );
}
