import Providers from './providers';

import '../components/common/assets/css/flaticon.css';
import '../styles/globals.css';

export const metadata = {
  title: 'A Very khriztianmoreno Website — Javascript Developer 👨🏼‍💻🇨🇴💻',
  description:
    'khriztianmoreno is a web developer, educator, and community builder. Helps others learn by doing through articles, videos, and courses about JavaScript, React, and the static web.',
  metadataBase: new URL('https://khriztianmoreno.dev'),
  canonical: 'https://khriztianmoreno.dev/',
  openGraph: {
    type: 'website',
    url: 'https://khriztianmoreno.dev/',
    description:
      'khriztianmoreno is a web developer, educator, and community builder.',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link
          href="https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700,800|Roboto:300,400,400i,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
