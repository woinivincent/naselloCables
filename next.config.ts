import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
    output:'standalone'
      
  ,
  
  eslint: {
   
    ignoreDuringBuilds: true,
    
  },
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true 
  },
  
};

export default nextConfig;
