import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  experimental: {
    serverActions: {
      bodySizeLimit: "22mb",
    },
  },
};

export default nextConfig;
