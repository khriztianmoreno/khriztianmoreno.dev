import { type Metadata } from 'next';
import Providers from './providers';

import '../components/common/assets/css/flaticon.css';
import '../styles/globals.css';

export const metadata: Metadata = {
  title:
    'Khriztian Moreno — Full Stack AI Engineer & Technical Evangelist 👨🏼‍💻🇨🇴',
  description:
    'Full Stack AI Engineer, Google Developer Expert, and community leader from Medellín, Colombia. 15+ years building scalable web architectures at MercadoLibre, Globant, and more. Speaker, educator, and open-source contributor.',
  metadataBase: new URL('https://khriztianmoreno.dev'),
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
