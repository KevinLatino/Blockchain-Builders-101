import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente del contrato (packages/xlm-token) lo genera la Stellar CLI en
  // TypeScript sin compilar: le pedimos a Next que lo compile junto con la app.
  transpilePackages: ["xlm-token"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
