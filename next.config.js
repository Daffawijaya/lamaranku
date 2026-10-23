/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build verifikasi opencode memakai folder sendiri agar tidak
  // mengganggu dev server yang sedang jalan (NEXT_DIST_DIR=.next-verify).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  webpack(config) {
    // Serve PDF.js's module worker as a file, without bundling its runtime.
    config.module.rules.push({
      test: /pdf\.worker\.min\.mjs$/,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
