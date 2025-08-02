/** @type {import('next').NextConfig} */
const nextConfig = {
  // This will disable React Strict Mode and prevent double-rendering in development
  reactStrictMode: false,
  
  // Your existing configurations below
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;