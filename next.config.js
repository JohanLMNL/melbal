const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Désactiver en développement
  register: true, // S'assurer que le service worker est bien enregistré
  skipWaiting: true, // Forcer la mise à jour du service worker
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Si tu veux activer le mode strict de React
  // Autres configurations Next.js ici
};

module.exports = withPWA(nextConfig);
