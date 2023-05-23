/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  typescript: {
    // Next has poor support for TS project references, so just disable it
    // and rely on calling tsc ourselves
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
