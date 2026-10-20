/** @type {import('next').NextConfig} */
const apiIsLocal = /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_API_URL || 'http://localhost');

const nextConfig = {
  images: {
    // Next.js won't optimise images served from a local address, so skip optimisation in local dev
    unoptimized: apiIsLocal,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};
export default nextConfig;
