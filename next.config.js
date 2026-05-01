const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // Keep dev and build artifacts separate to prevent manifest race conditions.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    images: {
      formats: ["image/avif", "image/webp"]
    }
  };

  return nextConfig;
};
