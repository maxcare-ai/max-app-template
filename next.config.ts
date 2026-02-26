import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["typeorm", "pg", "reflect-metadata", "pino", "pino-pretty"],
  turbopack: {
    resolveAlias: {
      "react/jsx-dev-runtime": "./src/shims/jsx-dev-runtime.ts",
    },
  },
};

export default nextConfig;
