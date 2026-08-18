import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UserRole } from "@culebra/domain";

import { signAccessToken, verifyAccessToken } from "./jwt.js";
import type { AuthUser } from "./types.js";

const testUser: AuthUser = {
  id: "user_test_1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  roles: [UserRole.CONSUMER],
  status: "ACTIVE",
};

describe("jwt", () => {
  const previousSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.AUTH_SECRET = "test-secret-with-enough-length-for-jwt";
  });

  afterEach(() => {
    process.env.AUTH_SECRET = previousSecret;
  });

  it("firma y verifica un access token", async () => {
    const token = await signAccessToken(testUser);
    const payload = await verifyAccessToken(token);
    expect(payload).toMatchObject({
      sub: testUser.id,
      email: testUser.email,
      roles: testUser.roles,
    });
  });

  it("rechaza tokens invalidos", async () => {
    await expect(verifyAccessToken("token-invalido")).resolves.toBeNull();
  });
});
