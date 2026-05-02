import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ NEW key (Next.js 16)
  serverExternalPackages: ["@sparticuz/chromium"],

  // ✅ Fix Turbopack error
  turbopack: {},
};

export default nextConfig;