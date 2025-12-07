/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    domains: ['images.unsplash.com', 'cdn.remoof.bike']
  }
};

module.exports = nextConfig;
