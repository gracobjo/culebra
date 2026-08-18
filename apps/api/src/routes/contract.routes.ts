import type { FastifyInstance, FastifyReply } from "fastify";
import { ContractStatus, UserRole } from "@culebra/domain";
import {
  acceptContractVersion,
  contractVersionCreateSchema,
  createContractVersionForAdmin,
  getContractById,
  getVendorContractStatus,
  listContractsForAdmin,
  publishContractVersionForAdmin,
} from "@culebra/auth";

import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handleContractError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }

  const map: Record<string, number> = {
    VENDOR_NOT_FOUND: 404,
    CONTRACT_NOT_FOUND: 404,
    CONTRACT_VERSION_NOT_FOUND: 404,
    CONTRACT_FORBIDDEN: 403,
    CONTRACT_INVALID_STATUS: 400,
    CONTRACT_ALREADY_ACCEPTED: 409,
    CONTRACT_PENDING_EXISTS: 409,
  };

  const status = map[error.message] ?? 500;
  reply.code(status).send({ error: error.message });
}

export async function contractRoutes(app: FastifyInstance) {
  app.get(
    "/vendors/me/contracts",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR, UserRole.ADMIN)] },
    async (request, reply) => {
      try {
        const status = await getVendorContractStatus(request.authUser!.id);
        reply.send(status);
      } catch (error) {
        handleContractError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/contracts/versions/:versionId/accept",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      const { versionId } = request.params as { versionId: string };

      try {
        const contract = await acceptContractVersion(
          request.authUser!.id,
          versionId,
          { ipAddress: request.ip },
        );
        reply.send({ contract });
      } catch (error) {
        handleContractError(error, reply);
      }
    },
  );
}

export async function adminContractRoutes(app: FastifyInstance) {
  app.get(
    "/admin/contracts",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const query = request.query as {
        vendorId?: string;
        status?: ContractStatus;
        limit?: string;
        offset?: string;
      };

      const result = await listContractsForAdmin({
        vendorId: query.vendorId,
        status: query.status,
        limit: query.limit ? Number(query.limit) : undefined,
        offset: query.offset ? Number(query.offset) : undefined,
      });

      reply.send(result);
    },
  );

  app.get(
    "/admin/contracts/:id",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const contract = await getContractById(id);

      if (!contract) {
        reply.code(404).send({ error: "CONTRACT_NOT_FOUND" });
        return;
      }

      reply.send({ contract });
    },
  );

  app.post(
    "/admin/vendors/:vendorId/contracts/versions",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const parsed = contractVersionCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        reply.code(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
        return;
      }

      const { vendorId } = request.params as { vendorId: string };

      try {
        const contract = await createContractVersionForAdmin(
          request.authUser!.id,
          vendorId,
          parsed.data,
          { ipAddress: request.ip },
        );
        reply.code(201).send({ contract });
      } catch (error) {
        handleContractError(error, reply);
      }
    },
  );

  app.post(
    "/admin/contracts/:contractId/versions/:versionId/publish",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async (request, reply) => {
      const { contractId, versionId } = request.params as {
        contractId: string;
        versionId: string;
      };

      try {
        const contract = await publishContractVersionForAdmin(
          request.authUser!.id,
          contractId,
          versionId,
          { ipAddress: request.ip },
        );
        reply.send({ contract });
      } catch (error) {
        handleContractError(error, reply);
      }
    },
  );
}
