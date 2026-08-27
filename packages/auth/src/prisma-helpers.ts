import type { Prisma } from "@prisma/client";

/** Cast seguro para campos Json de Prisma (metadata, snapshots…). */
export function toInputJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return {};
  return value as Prisma.InputJsonValue;
}

/** Para campos Json obligatorios en create. */
export function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === undefined || value === null) return {};
  return value as Prisma.InputJsonValue;
}
