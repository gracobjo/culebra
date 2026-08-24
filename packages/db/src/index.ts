import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaCulebra?: PrismaClient };

export const prisma =
  globalForPrisma.prismaCulebra ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaCulebra = prisma;
}

export * from "@prisma/client";
export { prisma as db };
