/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ désactive le blocage en cas d'erreurs ESLint
  },
  images: {
    domains: ['cgaweb-drom.canal-plus.com'],
  },
};


// next.config.js
module.exports = {
  logging: {
    incomingRequests: false,
  },
}
