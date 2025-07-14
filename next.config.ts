import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'convex-backend-production-587a.up.railway.app',
        pathname: '/api/storage/**',
      },
    ],
  },
};

export default nextConfig;
