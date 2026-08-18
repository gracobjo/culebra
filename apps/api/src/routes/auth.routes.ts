import type { FastifyInstance } from "fastify";
import { UserRole } from "@culebra/domain";
import {
  loginSchema,
  loginUser,
  logoutUser,
  passwordResetRequestSchema,
  registerSchema,
  registerUser,
  requestPasswordReset,
} from "@culebra/auth";

import { config } from "../lib/config.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function getRequestContext(request: {
  ip: string;
  headers: { "user-agent"?: string };
}) {
  return {
    ipAddress: request.ip,
    userAgent: request.headers["user-agent"],
  };
}

function setSessionCookie(
  reply: {
    setCookie: (
      name: string,
      value: string,
      options: Record<string, unknown>,
    ) => void;
  },
  sessionToken: string,
  expiresAt: Date,
) {
  reply.setCookie(config.sessionCookieName, sessionToken, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
      return;
    }

    try {
      const session = await registerUser(parsed.data, getRequestContext(request));
      setSessionCookie(reply, session.sessionToken, session.expiresAt);

      reply.code(201).send({
        user: session.user,
        accessToken: session.accessToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        reply.code(409).send({ error: "EMAIL_ALREADY_EXISTS" });
        return;
      }
      throw error;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
      return;
    }

    const session = await loginUser(parsed.data, getRequestContext(request));
    if (!session) {
      reply.code(401).send({ error: "INVALID_CREDENTIALS" });
      return;
    }

    setSessionCookie(reply, session.sessionToken, session.expiresAt);

    reply.send({
      user: session.user,
      accessToken: session.accessToken,
    });
  });

  app.post(
    "/auth/logout",
    { preHandler: authenticate },
    async (request, reply) => {
      const sessionToken = request.cookies[config.sessionCookieName];
      if (sessionToken) {
        await logoutUser(sessionToken, {
          ipAddress: request.ip,
          userId: request.authUser?.id,
        });
      }

      reply.clearCookie(config.sessionCookieName, { path: "/" });
      reply.send({ success: true });
    },
  );

  app.get(
    "/auth/me",
    { preHandler: authenticate },
    async (request, reply) => {
      reply.send({ user: request.authUser });
    },
  );

  app.post("/auth/password-reset/request", async (request, reply) => {
    const parsed = passwordResetRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({
        error: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
      return;
    }

    const result = await requestPasswordReset(parsed.data.email);

    if (process.env.NODE_ENV === "development" && result.token) {
      reply.send({
        success: true,
        message:
          "En produccion se enviara un email. Token de desarrollo incluido.",
        devResetToken: result.token,
      });
      return;
    }

    reply.send({
      success: true,
      message:
        "Si el email existe, recibiras instrucciones para restablecer la contrasena.",
    });
  });
}

export async function protectedRoutes(app: FastifyInstance) {
  app.get(
    "/admin/status",
    { preHandler: [authenticate, requireRoles(UserRole.ADMIN)] },
    async () => ({
      ok: true,
      scope: "admin",
    }),
  );

  app.get(
    "/vendor/status",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async () => ({
      ok: true,
      scope: "vendor",
    }),
  );

  app.get(
    "/consumer/status",
    { preHandler: [authenticate, requireRoles(UserRole.CONSUMER)] },
    async () => ({
      ok: true,
      scope: "consumer",
    }),
  );
}
