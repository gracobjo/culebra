import Fastify from "fastify";
import { prisma } from "@culebra/db";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  let database: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    database = "disconnected";
  }

  return {
    status: database === "connected" ? "ok" : "degraded",
    service: "culebra-api",
    phase: 2,
    database,
  };
});

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

const port = Number(process.env.API_PORT ?? 4000);

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
