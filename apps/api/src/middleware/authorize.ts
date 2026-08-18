import type { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "@culebra/domain";
import { hasAnyRole } from "@culebra/auth";

export function requireRoles(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      reply.code(401).send({ error: "UNAUTHORIZED" });
      return;
    }

    if (!hasAnyRole(request.authUser.roles, roles)) {
      reply.code(403).send({ error: "FORBIDDEN" });
      return;
    }
  };
}
