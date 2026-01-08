import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for cleaner hydration
  reactStrictMode: false,

  // Skip type checking on build for faster deploys
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image configuration for external images
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
