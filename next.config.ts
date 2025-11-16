import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Necesario para Docker
};

export default nextConfig;
