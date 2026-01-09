/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // External packages per server components
  experimental: {
    serverComponentsExternalPackages: [
      'pdfkit',
      'fontkit',
      'png-js',
      'brotli'
    ],
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
      
      // Ignora file font durante il bundling
      config.module.rules.push({
        test: /\.(afm|ttf|otf|pfb)$/,
        use: 'null-loader',
      })
    }
    
    return config
  },
}

module.exports = nextConfig
