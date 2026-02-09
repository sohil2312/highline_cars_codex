/** @type {import('next').NextConfig} */
import { execSync } from "node:child_process";

const getGitSha = () => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
};

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },
  experimental: {
    serverComponentsExternalPackages: [
      "playwright",
      "playwright-core",
      "puppeteer-core",
      "@sparticuz/chromium"
    ]
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: getGitSha()
  }
};

export default nextConfig;
