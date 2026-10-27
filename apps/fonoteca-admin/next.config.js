import { legacyRedirects } from "./config/legacy-redirects.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  async redirects() {
    return legacyRedirects.map((route) => ({ ...route, permanent: false }));
  },
};

export default nextConfig;
