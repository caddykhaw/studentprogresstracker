/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Remove properties that might cause issues
    removeConsole: process.env.NODE_ENV === 'production',
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
}

module.exports = nextConfig 