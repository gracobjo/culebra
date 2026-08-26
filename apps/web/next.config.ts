import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
loadEnvConfig(monorepoRoot);

function getServerActionsAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "*.app.github.dev",
    "*.github.dev",
    "*.devtunnels.ms",
  ]);

  for (let port = 3000; port <= 3010; port += 1) {
    origins.add(`localhost:${port}`);
    origins.add(`127.0.0.1:${port}`);
  }

  const codespaceName = process.env.CODESPACE_NAME?.trim();
  const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN?.trim();
  if (codespaceName && forwardingDomain) {
    origins.add(`${codespaceName}-3000.${forwardingDomain}`);
  }

  for (const value of [process.env.AUTH_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!value?.trim()) continue;
    try {
      origins.add(new URL(value.trim()).host);
    } catch {
      const host = value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (host) origins.add(host);
    }
  }

  const extra = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS?.trim();
  if (extra) {
    for (const item of extra.split(",")) {
      const host = item.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (host) origins.add(host);
    }
  }

  return [...origins];
}

const serverActionsAllowedOrigins = getServerActionsAllowedOrigins();

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@culebra/auth", "@culebra/db", "@culebra/domain", "@culebra/assistant"],
  serverExternalPackages: ["@prisma/client", "bcryptjs", "pdfkit", "fontkit"],
  experimental: {
    serverActions: {
      allowedOrigins: serverActionsAllowedOrigins,
    },
  },
  webpack: (config) => {
    const authRoot = path.resolve(monorepoRoot, "packages/auth");
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      // Solo el barrel principal (coincidencia exacta). Subpaths → módulos client-safe.
      "@culebra/auth$": path.resolve(authRoot, "dist/index.js"),
      "@culebra/auth/affiliate.constants": path.resolve(
        authRoot,
        "src/affiliate.constants.ts",
      ),
      "@culebra/auth/showroom-footfall.schemas": path.resolve(
        authRoot,
        "src/showroom-footfall.schemas.ts",
      ),
      "@culebra/auth/showroom-loyalty.schemas": path.resolve(
        authRoot,
        "src/showroom-loyalty.schemas.ts",
      ),
      "@culebra/auth/showroom-pricing.service": path.resolve(
        authRoot,
        "src/showroom-pricing.service.ts",
      ),
      "@culebra/auth/showroom-pricing.schemas": path.resolve(
        authRoot,
        "src/showroom-pricing.schemas.ts",
      ),
    };
    return config;
  },
  images: {
    remotePatterns: Array.from({ length: 11 }, (_, i) => 3000 + i).flatMap((port) => [
      {
        protocol: "http" as const,
        hostname: "localhost",
        port: String(port),
        pathname: "/uploads/products/**",
      },
      {
        protocol: "http" as const,
        hostname: "127.0.0.1",
        port: String(port),
        pathname: "/uploads/products/**",
      },
    ]),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
