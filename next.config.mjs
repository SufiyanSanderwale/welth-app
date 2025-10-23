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

  // Ensure Next picks this project as the root during dev
  turbopack: {
    root: process.cwd(),
  },

  // Temporarily allow LAN origin for dev to silence warning
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.56.1:3000",
  ],

  // ✅ yeh line add karo
  productionBrowserSourceMaps: true,
};

export default nextConfig;
