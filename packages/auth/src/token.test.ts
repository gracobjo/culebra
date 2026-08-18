import { describe, expect, it } from "vitest";

import { generateSecureToken, hashToken } from "./token.js";

describe("token", () => {
  it("generateSecureToken produce valores unicos", () => {
    const a = generateSecureToken();
    const b = generateSecureToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashToken es determinista", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("xyz"));
  });
});
