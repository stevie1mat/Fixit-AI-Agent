/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
  },
  // Add webpack configuration to handle potential issues
  webpack: (config, { isServer }) => {
    // Handle potential crypto polyfill issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
