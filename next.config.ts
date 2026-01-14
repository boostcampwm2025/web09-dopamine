import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
