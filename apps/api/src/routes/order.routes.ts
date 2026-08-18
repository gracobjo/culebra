import type { FastifyInstance, FastifyReply } from "fastify";
import { UserRole } from "@culebra/domain";
import {
  getOrderByNumber,
  getVendorOrder,
  guestOrderLookupSchema,
  listOrdersForUser,
  listVendorOrders,
  lookupGuestOrder,
  shipVendorOrder,
  shipVendorOrderSchema,
  updateVendorOrderStatus,
  vendorOrderStatusSchema,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleOrderError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }
  const map: Record<string, number> = {
    VENDOR_NOT_FOUND: 404,
    VENDOR_ORDER_NOT_FOUND: 404,
    VENDOR_ORDER_INVALID_STATUS: 400,
  };
  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function orderRoutes(app: FastifyInstance) {
  app.get(
    "/orders",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const items = await listOrdersForUser(request.authUser!.id);
      reply.send({ items });
    },
  );

  app.get("/orders/:orderNumber", { preHandler: [authenticate] }, async (request, reply) => {
    const { orderNumber } = request.params as { orderNumber: string };
    const order = await getOrderByNumber(orderNumber, { userId: request.authUser!.id });
    if (!order) {
      reply.code(404).send({ error: "ORDER_NOT_FOUND" });
      return;
    }
    reply.send({ order });
  });

  app.post("/orders/lookup", async (request, reply) => {
    const parsed = guestOrderLookupSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
      return;
    }
    const order = await lookupGuestOrder(parsed.data.orderNumber, parsed.data.email);
    if (!order) {
      reply.code(404).send({ error: "ORDER_NOT_FOUND" });
      return;
    }
    reply.send({ order });
  });

  app.get(
    "/vendors/me/orders",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const items = await listVendorOrders(request.authUser!.id);
        reply.send({ items });
      } catch (error) {
        handleOrderError(error, reply);
      }
    },
  );

  app.get(
    "/vendors/me/orders/:id",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const order = await getVendorOrder(request.authUser!.id, id);
        reply.send({ order });
      } catch (error) {
        handleOrderError(error, reply);
      }
    },
  );

  app.patch(
    "/vendors/me/orders/:id/status",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = vendorOrderStatusSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
        return;
      }
      try {
        const order = await updateVendorOrderStatus(request.authUser!.id, id, parsed.data);
        reply.send({ order });
      } catch (error) {
        handleOrderError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/orders/:id/ship",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = shipVendorOrderSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
        return;
      }
      try {
        const order = await shipVendorOrder(request.authUser!.id, id, parsed.data);
        reply.send({ order });
      } catch (error) {
        handleOrderError(error, reply);
      }
    },
  );
}
