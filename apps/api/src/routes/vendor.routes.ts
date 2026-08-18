import type { FastifyInstance, FastifyReply } from "fastify";
import { UserRole, VendorStatus } from "@culebra/domain";
import {
  applyAsVendor,
  getPublicVendorBySlug,
  getVendorByUserId,
  listPublicVendors,
  listVendorsForAdmin,
  submitVendorForReview,
  updateVendorProfile,
  updateVendorStatusByAdmin,
  vendorApplySchema,
  vendorStatusUpdateSchema,
  vendorUpdateSchema,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleVendorError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }

  const map: Record<string, number> = {
    VENDOR_ALREADY_EXISTS: 409,
    VENDOR_NOT_FOUND: 404,
    VENDOR_NOT_EDITABLE: 403,
    VENDOR_INVALID_STATUS: 400,
    VENDOR_PROFILE_INCOMPLETE: 400,
    VENDOR_FORBIDDEN: 403,
  };

  const status = map[error.message] ?? 500;
  reply.code(status).send({ error: error.message });
}

export async function vendorRoutes(app: FastifyInstance) {
  app.get("/vendors", async (request, reply) => {
    const query = request.query as {
      search?: string;
      province?: string;
      limit?: string;
      offset?: string;
    };

    const result = await listPublicVendors({
      search: query.search,
      province: query.province,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    });

    reply.send(result);
  });

  app.get("/vendors/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const vendor = await getPublicVendorBySlug(slug);

    if (!vendor) {
      reply.code(404).send({ error: "VENDOR_NOT_FOUND" });
      return;
    }

    reply.send({ vendor });
  });

  app.post(
    "/vendors/apply",
    { preHandler: [authenticate, requireRoles(UserRole.CONSUMER, UserRole.VENDOR)] },
    async (request, reply) => {
      const parsed = vendorApplySchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      try {
        const vendor = await applyAsVendor(request.authUser!.id, parsed.data, {
          ipAddress: request.ip,
        });
        reply.code(201).send({ vendor });
      } catch (error) {
        handleVendorError(error, reply);
      }
    },
  );

  app.get(
    "/vendors/me/profile",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR, UserRole.ADMIN)] },
    async (request, reply) => {
      const vendor = await getVendorByUserId(request.authUser!.id);
      if (!vendor) {
        reply.code(404).send({ error: "VENDOR_NOT_FOUND" });
        return;
      }
      reply.send({ vendor });
    },
  );

  app.patch(
    "/vendors/me/profile",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR, UserRole.ADMIN)] },
    async (request, reply) => {
      const parsed = vendorUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      try {
        const vendor = await updateVendorProfile(
          request.authUser!.id,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.send({ vendor });
      } catch (error) {
        handleVendorError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/submit",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const vendor = await submitVendorForReview(request.authUser!.id, {
          ipAddress: request.ip,
        });
        reply.send({ vendor });
      } catch (error) {
        handleVendorError(error, reply);
      }
    },
  );
}

export async function adminVendorRoutes(app: FastifyInstance) {
  app.get(
    "/admin/vendors",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as {
        status?: VendorStatus;
        limit?: string;
        offset?: string;
      };

      const result = await listVendorsForAdmin({
        status: query.status,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });

      reply.send(result);
    },
  );

  app.patch(
    "/admin/vendors/:id/status",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const parsed = vendorStatusUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      const { id } = request.params as { id: string };

      try {
        const vendor = await updateVendorStatusByAdmin(
          id,
          request.authUser!.id,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.send({ vendor });
      } catch (error) {
        handleVendorError(error, reply);
      }
    },
  );
}
