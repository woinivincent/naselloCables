import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    
  },
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true // Temporalmente para probar si el problema es solo de tipos
  },
};

export default nextConfig;
