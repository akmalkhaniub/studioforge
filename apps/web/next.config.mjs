/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@studioforge/graphql-codegen', '@studioforge/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.studioforge.ai',
      },
    ],
  },
};

export default nextConfig;
