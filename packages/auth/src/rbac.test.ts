import { describe, expect, it } from "vitest";
import { UserRole } from "@culebra/domain";

import { hasAllRoles, hasAnyRole, hasRole } from "./rbac.js";

describe("rbac", () => {
  const roles = [UserRole.CONSUMER, UserRole.VENDOR];

  it("hasRole detecta un rol presente", () => {
    expect(hasRole(roles, UserRole.VENDOR)).toBe(true);
    expect(hasRole(roles, UserRole.ADMIN)).toBe(false);
  });

  it("hasAnyRole acepta al menos uno", () => {
    expect(hasAnyRole(roles, [UserRole.ADMIN, UserRole.VENDOR])).toBe(true);
    expect(hasAnyRole(roles, [UserRole.ADMIN])).toBe(false);
  });

  it("hasAllRoles exige todos", () => {
    expect(hasAllRoles(roles, [UserRole.CONSUMER, UserRole.VENDOR])).toBe(true);
    expect(hasAllRoles(roles, [UserRole.CONSUMER, UserRole.ADMIN])).toBe(false);
  });
});
