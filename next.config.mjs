const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'votenavigator-899006991543.asia-south1.run.app',
        'votenavigator-899006991543.europe-west1.run.app'
      ]
    }
  }
};

export default nextConfig;
