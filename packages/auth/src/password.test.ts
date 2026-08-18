import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password.js";

describe("password", () => {
  it("hash y verify funcionan en ciclo", async () => {
    const hash = await hashPassword("Password1");
    expect(hash).not.toBe("Password1");
    await expect(verifyPassword("Password1", hash)).resolves.toBe(true);
    await expect(verifyPassword("OtraClave1", hash)).resolves.toBe(false);
  });
});
