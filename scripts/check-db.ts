# Verificar conexion a PostgreSQL
# Uso: npm run db:check

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  const roles = await prisma.role.count();
  const categories = await prisma.category.count();
  console.log(`Database OK — roles: ${roles}, categories: ${categories}`);
}

main()
  .catch((error) => {
    console.error("Database check failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
