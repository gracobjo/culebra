function addHostFromUrl(target: Set<string>, value: string | undefined) {
  if (!value?.trim()) {
    return;
  }
  try {
    target.add(new URL(value.trim()).host);
  } catch {
    const withoutScheme = value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (withoutScheme) {
      target.add(withoutScheme);
    }
  }
}

/** Orígenes permitidos para Server Actions (CSRF) en dev, Codespaces y proxies. */
export function getServerActionsAllowedOrigins(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const origins = new Set<string>([
    "localhost:3000",
    "127.0.0.1:3000",
    "*.app.github.dev",
    "*.github.dev",
    "*.devtunnels.ms",
  ]);

  const codespaceName = env.CODESPACE_NAME?.trim();
  const forwardingDomain = env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN?.trim();
  if (codespaceName && forwardingDomain) {
    origins.add(`${codespaceName}-3000.${forwardingDomain}`);
  }

  addHostFromUrl(origins, env.AUTH_URL);
  addHostFromUrl(origins, env.NEXT_PUBLIC_APP_URL);

  const extra = env.SERVER_ACTIONS_ALLOWED_ORIGINS?.trim();
  if (extra) {
    for (const item of extra.split(",")) {
      const host = item.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (host) {
        origins.add(host);
      }
    }
  }

  return [...origins];
}
