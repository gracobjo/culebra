import { describe, expect, it } from "vitest";

import { loginSchema, passwordSchema, registerSchema } from "./schemas.js";

describe("auth schemas", () => {
  it("registerSchema acepta datos validos", () => {
    const parsed = registerSchema.safeParse({
      email: "comprador@example.com",
      password: "Password1",
      firstName: "Ana",
    });
    expect(parsed.success).toBe(true);
  });

  it("passwordSchema rechaza contrasenas debiles", () => {
    expect(passwordSchema.safeParse("abc").success).toBe(false);
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(passwordSchema.safeParse("Password1").success).toBe(true);
  });

  it("loginSchema exige email y contrasena", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(false);
    expect(
      loginSchema.safeParse({
        email: "comprador@example.com",
        password: "x",
      }).success,
    ).toBe(true);
  });
});
