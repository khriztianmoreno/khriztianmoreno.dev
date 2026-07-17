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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'blog.khriztianmoreno.dev' }],
        destination: 'https://www.khriztianmoreno.dev/blog/:path*',
        permanent: true,
      },
    ];
  },
};
