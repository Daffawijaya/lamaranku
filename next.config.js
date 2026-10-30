/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@embedpdf/pdfium"],
  outputFileTracingIncludes: {
    "/api/skor/perbaiki": ["./node_modules/@embedpdf/pdfium/dist/pdfium.wasm", "./app/fonts/myriadpro-regular.otf", "./app/fonts/myriadpro-bold.otf"],
  },
  // Build verifikasi opencode memakai folder sendiri agar tidak
  // mengganggu dev server yang sedang jalan (NEXT_DIST_DIR=.next-verify).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return ["/dashboard/:path*", "/auth/:path*", "/api/:path*", "/masuk", "/reset-password", "/cv-builder/isi/:path*"].map(source => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
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
