/** @type {import('next').NextConfig} */

import dotenv from 'dotenv'; // Use ES6 import
dotenv.config(); // Load .env variables

const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Enable SWC Minification for faster builds
  swcMinify: true,

  // Define environment variables to use in the app
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID, // Example for server-side
  },

  // Optimize image domains (if you use external images)
  images: {
    domains: ['example.com', 'anotherdomain.com'], // Add your domains for external images
  },

  // Custom Webpack configuration (optional)
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
