/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist', 'mammoth'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'pdfjs-dist': false,
        'pdfjs-dist/build/pdf.worker.min.mjs': false,
        mammoth: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
