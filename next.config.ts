import type { NextConfig } from 'next';
import path from 'path';

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // output: 'export' is required for cPanel static hosting.
  // In dev mode we omit it so route handlers (mock API) work normally.
  // `next build` always runs with NODE_ENV=production, so the export is preserved.
  ...(!isDev && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // In production builds, replace dev-only mock API routes with a static stub
    // so they don't break the static export (output: 'export').
    if (!isDev && isServer) {
      const { NormalModuleReplacementPlugin } = require('webpack');
      config.plugins.push(
        new NormalModuleReplacementPlugin(
          /[/\\]app[/\\]api[/\\][^/\\]+[/\\]route\.ts$/,
          path.resolve('./src/lib/mock-api-stub.ts')
        )
      );
    }

    return config;
  },
};

export default nextConfig;