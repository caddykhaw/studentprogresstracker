/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is no longer needed in Next.js 15 as it's the default
  // Suppress the warning about the cz-shortcut-listen attribute
  // This attribute is added by the Commitizen extension
  compiler: {
    // Suppress specific warnings or errors
    // https://nextjs.org/docs/architecture/nextjs-compiler#suppressing-errors
    reactRemoveProperties: { properties: ['^cz-shortcut-listen$'] },
  },
  // Server configuration
  httpAgentOptions: {
    keepAlive: true,
  }
}

module.exports = nextConfig 