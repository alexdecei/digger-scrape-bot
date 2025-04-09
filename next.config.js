/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ désactive le blocage en cas d'erreurs ESLint
  },
  images: {
    domains: ['cgaweb-drom.canal-plus.com'],
  },
};

module.exports = nextConfig;

