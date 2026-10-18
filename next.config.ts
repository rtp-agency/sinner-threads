import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "backend.mydrop.com.ua", pathname: "/vendor/products/uploads/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
