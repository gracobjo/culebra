import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { prisma } from "@culebra/db";

import { config } from "./lib/config.js";
import { authRoutes, protectedRoutes } from "./routes/auth.routes.js";
import { adminVendorRoutes, vendorRoutes } from "./routes/vendor.routes.js";
import { adminProductRoutes, productRoutes } from "./routes/product.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { paymentRoutes, stripeWebhookRoutes } from "./routes/payment.routes.js";
import { adminContractRoutes, contractRoutes } from "./routes/contract.routes.js";
import { adminCommissionRoutes, commissionRoutes } from "./routes/commission.routes.js";
import { adminPanelRoutes } from "./routes/admin.routes.js";

async function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1_048_576,
    trustProxy: config.trustProxy,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(rateLimit, {
    global: true,
    max: config.rateLimitGlobalMax,
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
      phase: 13,
      database,
    };
  });

  await app.register(
    async (authScope) => {
      await authScope.register(rateLimit, {
        max: config.rateLimitAuthMax,
        timeWindow: "1 minute",
      });
      await authRoutes(authScope);
    },
    { prefix: "" },
  );

  await app.register(
    async (cartScope) => {
      await cartScope.register(rateLimit, {
        max: config.rateLimitCartMax,
        timeWindow: "1 minute",
      });
      await cartRoutes(cartScope);
    },
    { prefix: "" },
  );

  await app.register(
    async (adminScope) => {
      await adminScope.register(rateLimit, {
        max: config.rateLimitAdminMax,
        timeWindow: "1 minute",
      });
      await adminVendorRoutes(adminScope);
      await adminProductRoutes(adminScope);
      await adminContractRoutes(adminScope);
      await adminCommissionRoutes(adminScope);
      await adminPanelRoutes(adminScope);
    },
    { prefix: "" },
  );

  await protectedRoutes(app);
  await vendorRoutes(app);
  await productRoutes(app);
  await orderRoutes(app);
  await paymentRoutes(app);
  await stripeWebhookRoutes(app);
  await contractRoutes(app);
  await commissionRoutes(app);

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
