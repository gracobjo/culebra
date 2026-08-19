import { describe, expect, it } from "vitest";

import { getServerActionsAllowedOrigins } from "./server-actions-origins";

describe("getServerActionsAllowedOrigins", () => {
  it("incluye localhost y wildcards de Codespaces", () => {
    const origins = getServerActionsAllowedOrigins({});
    expect(origins).toContain("localhost:3000");
    expect(origins).toContain("*.app.github.dev");
  });

  it("añade el host del codespace cuando hay variables de GitHub", () => {
    const origins = getServerActionsAllowedOrigins({
      CODESPACE_NAME: "mi-repo",
      GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "app.github.dev",
    });
    expect(origins).toContain("mi-repo-3000.app.github.dev");
  });

  it("añade hosts desde AUTH_URL y lista extra", () => {
    const origins = getServerActionsAllowedOrigins({
      AUTH_URL: "https://demo-3000.app.github.dev",
      SERVER_ACTIONS_ALLOWED_ORIGINS: "otro-3000.app.github.dev",
    });
    expect(origins).toContain("demo-3000.app.github.dev");
    expect(origins).toContain("otro-3000.app.github.dev");
  });
});
