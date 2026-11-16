import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating Next.js dev badge (bottom-left). Dev-only; it never appears in production.
  devIndicators: false,
  // /discover became /issues; /solved moved into My issues.
  async redirects() {
    return [
      { source: "/discover", destination: "/issues", permanent: true },
      { source: "/solved", destination: "/my-issues", permanent: true },
    ];
  },
};

export default nextConfig;
