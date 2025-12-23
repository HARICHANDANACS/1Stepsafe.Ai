import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Adding the allowedDevOrigins configuration for the development server
  // to resolve the cross-origin request error.
  allowedDevOrigins: [
    '*.cloudworkstations.dev',
    '*.firebase.studio',
  ],
};

export default nextConfig;
