import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El cliente del contrato (./poll) lo genera la Stellar CLI en TypeScript
  // sin compilar: le pedimos a Next que lo compile junto con la app.
  transpilePackages: ["poll"],
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
