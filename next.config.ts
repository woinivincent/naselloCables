import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // output: 'export' is required for cPanel static hosting.
  // In dev mode we omit it so route handlers (mock API) work normally.
  // `next build` always runs with NODE_ENV=production, so the export is preserved.
  ...(!isDev && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true, // ✅ obligatorio en exportación estática si usás <Image />
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;