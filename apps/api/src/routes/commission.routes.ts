import type { FastifyInstance, FastifyReply } from "fastify";
import { PayoutStatus, UserRole } from "@culebra/domain";
import {
  commissionRuleCreateSchema,
  createCommissionRuleForAdmin,
  listCommissionRulesForUser,
  listCommissionRulesForVendor,
  listPayoutsForAdmin,
  listPayoutsForVendor,
  retryPendingPayoutsForVendor,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleCommissionError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }

  const map: Record<string, number> = {
    VENDOR_NOT_FOUND: 404,
    CATEGORY_NOT_FOUND: 404,
    STRIPE_NOT_CONFIGURED: 503,
    VENDOR_STRIPE_NOT_READY: 400,
  };
  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function commissionRoutes(app: FastifyInstance) {
  app.get(
    "/vendors/me/commission-rules",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR, UserRole.ADMIN)] },
    async (request, reply) => {
      try {
        const rules = await listCommissionRulesForUser(request.authUser!.id);
        reply.send({ rules });
      } catch (error) {
        handleCommissionError(error, reply);
      }
    },
  );

  app.get(
    "/vendors/me/payouts",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const query = request.query as {
        status?: PayoutStatus;
        limit?: string;
        offset?: string;
      };
      try {
        const result = await listPayoutsForVendor(request.authUser!.id, {
          status: query.status,
          limit: query.limit ? Number(query.limit) : undefined,
          offset: query.offset ? Number(query.offset) : undefined,
        });
        reply.send(result);
      } catch (error) {
        handleCommissionError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/payouts/retry",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const result = await retryPendingPayoutsForVendor(request.authUser!.id);
        reply.send(result);
      } catch (error) {
        handleCommissionError(error, reply);
      }
    },
  );
}

export async function adminCommissionRoutes(app: FastifyInstance) {
  app.get(
    "/admin/vendors/:vendorId/commission-rules",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const { vendorId } = request.params as { vendorId: string };
      try {
        const rules = await listCommissionRulesForVendor(vendorId);
        reply.send({ rules });
      } catch (error) {
        handleCommissionError(error, reply);
      }
    },
  );

  app.post(
    "/admin/vendors/:vendorId/commission-rules",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const parsed = commissionRuleCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      const { vendorId } = request.params as { vendorId: string };
      try {
        const rule = await createCommissionRuleForAdmin(
          request.authUser!.id,
          vendorId,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.code(201).send({ rule });
      } catch (error) {
        handleCommissionError(error, reply);
      }
    },
  );

  app.get(
    "/admin/payouts",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as {
        vendorId?: string;
        status?: PayoutStatus;
        limit?: string;
        offset?: string;
      };
      const result = await listPayoutsForAdmin({
        vendorId: query.vendorId,
        status: query.status,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });
      reply.send(result);
    },
  );
}
