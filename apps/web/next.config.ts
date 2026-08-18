import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@culebra/auth", "@culebra/db", "@culebra/domain"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
