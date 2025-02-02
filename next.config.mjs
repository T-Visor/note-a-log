import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 🔥 Disable ESLint during builds
  },
});

export default nextConfig;
