/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 2592000,
  },
  experimental: {
    // Admin "Add product" can submit up to 10 photos via a Server Action.
    // Next.js default body size for Server Actions is 1MB — far too small.
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Serve the shop from ONE hostname. Both eonni.com.ua and www.eonni.com.ua used
  // to answer directly, and login cookies are bound to the exact host that set
  // them — so signing in on one and landing on the other (a bookmark, a search
  // result, a new tab) looked like being logged out. Also keeps duplicate URLs
  // out of search results, matching the canonical in the metadata.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.eonni.com.ua' }],
        destination: 'https://eonni.com.ua/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
