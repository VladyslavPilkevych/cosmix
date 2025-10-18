/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ui', '@sdk'],
  experimental: { typedRoutes: true },
};
export default nextConfig;
