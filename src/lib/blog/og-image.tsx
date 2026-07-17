import fs from 'node:fs';
import path from 'node:path';

import { ImageResponse } from 'next/og';

import { formatDateForOg } from './date';

/**
 * The OG image route is statically generated (`generateStaticParams` in
 * `src/app/blog/og/[slug]/route.tsx`), so this module only ever runs in
 * Next's build-time Node.js process — `fs` is safe here, unlike in an Edge
 * runtime request handler. Read once at module load and reused across
 * every slug's `generateOgImage` call.
 */
function loadPublicImageBase64(filename: string): string {
  const imagePath = path.join(process.cwd(), 'public', filename);
  const buffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

const LOGO_BASE64 = loadPublicImageBase64('logo.png');
const NAME_BASE64 = loadPublicImageBase64('name.png');

export interface OgImageOptions {
  title: string;
  date: Date | string;
  tags?: string[];
}

// Dracula theme colors, matching the Astro source project's OG card design.
const colors = {
  background: '#0d1117',
  darker: '#161b22',
  purple: '#bd93f9',
  pink: '#ff79c6',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  light: '#f8f8f2',
  comment: '#6272a4',
};

const INTER_BOLD =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff';
const INTER_BLACK =
  'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff';

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

/**
 * Generates the 1200x630 Open Graph card for a post, using Next's built-in
 * `next/og` (`ImageResponse`, backed by satori) instead of hand-rolled
 * satori + @resvg/resvg-js like the Astro source project did. Layout and
 * Dracula palette mirror that project's card: name.png wordmark on top,
 * title + purple tag pills in the middle, logo.png and an orange date pill
 * along the bottom.
 */
export async function generateOgImage({
  title,
  date,
  tags = [],
}: OgImageOptions): Promise<ImageResponse> {
  const displayTags = tags.slice(0, 3);
  const formattedDate = formatDateForOg(typeof date === 'string' ? new Date(date) : date);
  const titleFontSize = title.length > 60 ? 42 : title.length > 40 ? 48 : 56;

  const [interBold, interBlack] = await Promise.all([
    loadFont(INTER_BOLD),
    loadFont(INTER_BLACK),
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
          background: `linear-gradient(145deg, ${colors.background} 0%, #1e1e3f 35%, ${colors.darker} 65%, #1a1a2e 100%)`,
          fontFamily: 'Inter',
        }}
      >
        {/* Top section with name/brand wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori JSX, next/image is not supported here */}
          <img
            src={NAME_BASE64}
            alt="khriztianmoreno"
            width={400}
            height={50}
            style={{ objectFit: 'contain' }}
          />
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
              fontWeight: 900,
              color: colors.light,
              lineHeight: 1.2,
              letterSpacing: '-1px',
              textShadow: `0 4px 30px ${colors.purple}40`,
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
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${colors.purple}30, ${colors.pink}20)`,
                    border: `1px solid ${colors.purple}60`,
                    color: colors.purple,
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

        {/* Bottom section - Author and date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${colors.comment}40`,
            paddingTop: '24px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori JSX, next/image is not supported here */}
          <img
            src={LOGO_BASE64}
            alt="Logo"
            width={200}
            height={60}
            style={{ objectFit: 'contain', marginLeft: '-12px' }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.orange}20, ${colors.pink}15)`,
              border: `1px solid ${colors.orange}40`,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '16px',
                fontWeight: 700,
                color: colors.orange,
              }}
            >
              📅 {formattedDate}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interBold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: interBlack,
          weight: 900,
          style: 'normal',
        },
      ],
    }
  );
}
