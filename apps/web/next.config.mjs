/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cosmix/ui', '@cosmix/sdk'],
  experimental: { typedRoutes: true },
};
export default nextConfig;
