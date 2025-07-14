import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'export', // ✅ necesario para sitio estático
  trailingSlash: true, // ✅ útil si usás Netlify, GitHub Pages, o Hostinger
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