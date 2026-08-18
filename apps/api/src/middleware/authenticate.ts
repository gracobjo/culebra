import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getUserById,
  validateSessionToken,
  verifyAccessToken,
  type AuthUser,
} from "@culebra/auth";

import { config } from "../lib/config.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const sessionToken = request.cookies[config.sessionCookieName];

  if (sessionToken) {
    const user = await validateSessionToken(sessionToken);
    if (user) {
      request.authUser = user;
      return;
    }
  }

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);
    if (payload) {
      const user = await getUserById(payload.sub);
      if (user) {
        request.authUser = user;
        return;
      }
    }
  }

  reply.code(401).send({ error: "UNAUTHORIZED" });
}

export async function optionalAuthenticate(
  request: FastifyRequest,
): Promise<void> {
  const sessionToken = request.cookies[config.sessionCookieName];

  if (sessionToken) {
    const user = await validateSessionToken(sessionToken);
    if (user) {
      request.authUser = user;
      return;
    }
  }

  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);
    if (payload) {
      const user = await getUserById(payload.sub);
      if (user) {
        request.authUser = user;
      }
    }
  }
}
