/** @type {import('next').NextConfig} */

const apiUrlString = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
let apiHost = 'localhost';
let apiProtocol = 'http';
let apiPort = '8000';

try {
  const url = new URL(apiUrlString);
  apiHost = url.hostname;
  apiProtocol = url.protocol.replace(':', '');
  apiPort = url.port || ''; // Next.js expects empty string for default ports (80/443)
} catch (e) {
  console.warn('Invalid NEXT_PUBLIC_API_URL. Falling back to localhost for images.');
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHost,
        port: apiPort,
        pathname: '/api/uploads/**',
      },
      // Ensure strict localhost bindings also work for local dev
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/uploads/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/chat',
        destination: '/stylist',
        permanent: true,
      },
      {
        source: '/analytics',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/settings',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `${apiProtocol}://${apiHost}:${apiPort}/api/:path*`
        }
      ]
    }
  },
};

export default nextConfig;
