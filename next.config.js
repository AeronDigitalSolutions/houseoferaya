const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  const backendApiOrigin = process.env.BACKEND_API_ORIGIN?.replace(/\/+$/, "");

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // Keep dev and build artifacts separate to prevent manifest race conditions.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.unsplash.com"
        }
      ]
    },
    async rewrites() {
      if (!backendApiOrigin) {
        return [];
      }

      return [
        {
          source: "/api/:path*",
          destination: `${backendApiOrigin}/api/:path*`
        }
      ];
    }
  };

  return nextConfig;
};
