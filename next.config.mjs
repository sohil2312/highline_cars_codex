/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["playwright", "playwright-core", "@sparticuz/chromium"]
  }
};

export default nextConfig;
