/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/khriztianmoreno/**',
      },
    ],
  },
};
