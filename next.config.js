/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Suppress the warning about the cz-shortcut-listen attribute
  // This attribute is added by the Commitizen extension
  compiler: {
    // Suppress specific warnings or errors
    // https://nextjs.org/docs/architecture/nextjs-compiler#suppressing-errors
    reactRemoveProperties: { properties: ['^cz-shortcut-listen$'] },
  },
}

module.exports = nextConfig 