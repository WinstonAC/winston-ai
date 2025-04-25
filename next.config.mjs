/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  experimental: {
    // Removed appDir as it's no longer needed in Next.js 14
  },
  compiler: {
    styledComponents: true,
  },
};

export default config; 