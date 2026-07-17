import { type Metadata } from 'next';
import Providers from './providers';

import '../components/common/assets/css/flaticon.css';
import '../styles/globals.css';

/**
 * On Vercel, `VERCEL_URL` is the current deployment's own host (preview or
 * production) and `VERCEL_ENV` tells us which kind. Hardcoding
 * `metadataBase` to the production domain broke relative Open Graph/Twitter
 * image URLs (e.g. `/blog/og/[slug]`) on preview deployments — they'd
 * resolve against `khriztianmoreno.dev`, which doesn't have that deploy's
 * content, so social scrapers got a 404 for the image while the page's own
 * title/description (read directly off the shared preview URL) still
 * worked. Falling back to `VERCEL_URL` makes preview deployments
 * self-referencing; production still resolves to the canonical domain.
 */
const SITE_URL =
  process.env.VERCEL_ENV === 'production'
    ? 'https://khriztianmoreno.dev'
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

export const metadata: Metadata = {
  title:
    'Khriztian Moreno — Full Stack AI Engineer & Technical Evangelist 👨🏼‍💻🇨🇴',
  description:
    'Full Stack AI Engineer, Google Developer Expert, and community leader from Medellín, Colombia. 15+ years building scalable web architectures at MercadoLibre, Globant, and more. Speaker, educator, and open-source contributor.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    url: 'https://khriztianmoreno.dev/',
    description:
      'Full Stack AI Engineer, Google Developer Expert, and community leader. Speaker, educator, and open-source contributor from Medellín, Colombia.',
    images: [
      'https://res.cloudinary.com/khriztianmoreno/image/upload/v1591324325/KM-brand/card/kristian%20moreno-6_card-front%402x-assets/card-front.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@khriztianmoreno',
    images: [
      'https://res.cloudinary.com/khriztianmoreno/image/upload/v1591324325/KM-brand/card/kristian%20moreno-6_card-front%402x-assets/card-front.png',
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Open+Sans:wght@400;600&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="page-gradient text-on-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
