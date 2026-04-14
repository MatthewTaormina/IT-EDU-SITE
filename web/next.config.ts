import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow file tracing to include Content/ which lives outside the web/ root
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'i3.ytimg.com' },
    ],
  },
};

export default nextConfig;
