import { resolve } from "node:path";
import { importShowroomDailyStatsFromSyntheticCsv } from "../../auth/src/showroom-daily-stat.service.js";

async function main() {
  const csvArg = process.argv.find((a) => a.startsWith("--csv="));
  const csvPath = csvArg
    ? resolve(csvArg.slice("--csv=".length))
    : resolve(process.cwd(), "../../data/synthetic/culebra_showroom_daily.csv");

  console.log("Importando estadísticas showroom desde:", csvPath);
  const result = await importShowroomDailyStatsFromSyntheticCsv({
    csvPath,
    replace: true,
  });
  console.log(
    `OK: ${result.imported} días importados (${result.openDays} abiertos).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("@culebra/db");
    await prisma.$disconnect();
  });
