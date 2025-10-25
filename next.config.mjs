/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  // Output verbose logs and source maps for debugging
  devIndicators: {
    position: 'bottom-right',
  },
  productionBrowserSourceMaps: true,
  
  // Help with chunk loading
  crossOrigin: 'anonymous',
  assetPrefix: '',
  
  // Ensure Next picks this project as the root during dev
  turbopack: {
    root: process.cwd(),
  },

  // Temporarily allow LAN origin for dev to silence warning
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.56.1:3000",
    "http://192.168.1.163:3000",
    // Add common emulator host mappings so emulator/device origins are accepted by Next dev
    "http://10.0.2.2:3000",
    "http://10.0.3.2:3000",
  ],

};

export default nextConfig;
