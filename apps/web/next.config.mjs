import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  outputFileTracingExcludes: {
    "*": [
      "../../node_modules/@swc/**",
      "../../node_modules/esbuild/**",
    ],
  },
};

export default nextConfig;