import type { UserRole } from "@culebra/domain";

export function hasRole(userRoles: UserRole[], required: UserRole): boolean {
  return userRoles.includes(required);
}

export function hasAnyRole(userRoles: UserRole[], required: UserRole[]): boolean {
  return required.some((role) => userRoles.includes(role));
}

export function hasAllRoles(userRoles: UserRole[], required: UserRole[]): boolean {
  return required.every((role) => userRoles.includes(role));
}
