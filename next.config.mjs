/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['votenavigator-899006991543.asia-south1.run.app']
    }
  }
};

export default nextConfig;
