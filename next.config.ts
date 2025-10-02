import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warnings in USAGE_EXAMPLES files should not block builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type check is done separately
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
