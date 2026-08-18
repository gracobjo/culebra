import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { prisma } from "@culebra/db";

import { config } from "./lib/config.js";
import { authRoutes, protectedRoutes } from "./routes/auth.routes.js";
import { adminVendorRoutes, vendorRoutes } from "./routes/vendor.routes.js";
import { adminProductRoutes, productRoutes } from "./routes/product.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { orderRoutes } from "./routes/order.routes.js";

async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
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
      phase: 7,
      database,
    };
  });

  await app.register(
    async (authScope) => {
      await authScope.register(rateLimit, {
        max: 10,
        timeWindow: "1 minute",
      });
      await authRoutes(authScope);
    },
    { prefix: "" },
  );

  await protectedRoutes(app);
  await vendorRoutes(app);
  await adminVendorRoutes(app);
  await productRoutes(app);
  await adminProductRoutes(app);
  await cartRoutes(app);
  await orderRoutes(app);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}

const start = async () => {
  try {
    const app = await buildServer();
    await app.listen({ port: config.port, host: "0.0.0.0" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();
