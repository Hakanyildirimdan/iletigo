/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add output configuration for static export if needed
  output: 'standalone',
  // Disable image optimization for deployment
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
