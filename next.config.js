/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimization
  swcMinify: true,
  compress: true,
  optimizeFonts: true,
  
  // Environment variables are handled by Next.js automatically
  // No need to explicitly define them here for deployment
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['mongodb']
  }
}

module.exports = nextConfig