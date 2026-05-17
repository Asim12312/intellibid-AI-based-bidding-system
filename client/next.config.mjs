/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
