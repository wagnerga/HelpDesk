import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: process.env.REACT_STRICT_MODE === 'true',
  output: 'export',
  distDir: 'build',
  images: {
    unoptimized: true
  }
};

export default nextConfig;