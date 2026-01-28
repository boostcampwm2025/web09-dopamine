import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  compiler: {
    emotion: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'phinf.pstatic.net',
      },
    ],
  },
};

export default nextConfig;
