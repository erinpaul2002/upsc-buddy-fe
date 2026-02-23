import type { NextConfig } from "next";

const backendBase =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${backendBase}/health`,
      },
    ];
  },
};

export default nextConfig;
