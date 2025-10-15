/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
     loader: 'custom',
    loaderFile: './image-loader.ts',
    unoptimized: true,
  },
   eslint: {
    // ⚠️ Warning: This allows production builds to successfully complete
    // even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;