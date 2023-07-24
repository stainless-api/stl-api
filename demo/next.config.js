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
  webpack: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      extensionAlias: {
        ...config.resolve?.extensionAlias,
        ".js": [".ts", ".js"],
      },
    },
  }),
};

module.exports = nextConfig;
