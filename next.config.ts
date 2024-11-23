import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
   
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
