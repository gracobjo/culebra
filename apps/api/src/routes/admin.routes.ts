import type { FastifyInstance, FastifyReply } from "fastify";
import { OrderStatus, UserRole } from "@culebra/domain";
import {
  getAdminDashboardStats,
  getOrderByNumberForAdmin,
  listOrdersForAdmin,
  listUsersForAdmin,
  updateUserStatusByAdmin,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleAdminError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }
  const map: Record<string, number> = {
    USER_NOT_FOUND: 404,
    ORDER_NOT_FOUND: 404,
    ADMIN_CANNOT_SELF_SUSPEND: 400,
  };
  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function adminPanelRoutes(app: FastifyInstance) {
  app.get(
    "/admin/dashboard",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (_request, reply) => {
      const stats = await getAdminDashboardStats();
      reply.send({ stats });
    },
  );

  app.get(
    "/admin/users",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as { limit?: string; offset?: string };
      const result = await listUsersForAdmin({
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });
      reply.send(result);
    },
  );

  app.patch(
    "/admin/users/:id/status",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const body = request.body as { status?: string };
      if (body.status !== "ACTIVE" && body.status !== "SUSPENDED") {
        reply.code(400).send({ error: "VALIDATION_ERROR" });
        return;
      }
      const { id } = request.params as { id: string };
      try {
        const user = await updateUserStatusByAdmin(
          id,
          request.authUser!.id,
          body.status,
        );
        reply.send({ user });
      } catch (error) {
        handleAdminError(error, reply);
      }
    },
  );

  app.get(
    "/admin/orders",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as {
        status?: OrderStatus;
        limit?: string;
        offset?: string;
      };
      const result = await listOrdersForAdmin({
        status: query.status,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });
      reply.send(result);
    },
  );

  app.get(
    "/admin/orders/:orderNumber",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const { orderNumber } = request.params as { orderNumber: string };
      const order = await getOrderByNumberForAdmin(orderNumber);
      if (!order) {
        reply.code(404).send({ error: "ORDER_NOT_FOUND" });
        return;
      }
      reply.send({ order });
    },
  );
}
