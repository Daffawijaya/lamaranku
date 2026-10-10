/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build verifikasi opencode memakai folder sendiri agar tidak
  // mengganggu dev server yang sedang jalan (NEXT_DIST_DIR=.next-verify).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

module.exports = nextConfig;
