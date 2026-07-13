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
};

export default nextConfig;
