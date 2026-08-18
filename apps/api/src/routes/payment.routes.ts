import type { FastifyInstance, FastifyReply } from "fastify";
import { UserRole } from "@culebra/domain";
import {
  createOrderCheckoutSession,
  createVendorStripeOnboardingLink,
  getVendorStripeStatus,
  handleStripeWebhook,
} from "@culebra/auth";

import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import { requireRoles } from "../middleware/authorize.js";

function handlePaymentError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }
  const map: Record<string, number> = {
    STRIPE_NOT_CONFIGURED: 503,
    STRIPE_WEBHOOK_INVALID: 400,
    STRIPE_SESSION_FAILED: 502,
    ORDER_NOT_FOUND: 404,
    ORDER_NOT_PAYABLE: 400,
    ORDER_ALREADY_PAID: 409,
    PAYMENT_NOT_FOUND: 404,
    INVALID_PAYMENT_AMOUNT: 400,
    VENDOR_NOT_FOUND: 404,
  };
  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function paymentRoutes(app: FastifyInstance) {
  app.post(
    "/orders/:orderNumber/pay",
    { preHandler: [optionalAuthenticate] },
    async (request, reply) => {
      const { orderNumber } = request.params as { orderNumber: string };
      if (!request.authUser?.id) {
        reply.code(401).send({ error: "UNAUTHORIZED" });
        return;
      }
      try {
        const session = await createOrderCheckoutSession(orderNumber, {
          userId: request.authUser.id,
        });
        reply.send(session);
      } catch (error) {
        handlePaymentError(error, reply);
      }
    },
  );

  app.get(
    "/vendors/me/stripe",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const status = await getVendorStripeStatus(request.authUser!.id);
        reply.send({ stripe: status });
      } catch (error) {
        handlePaymentError(error, reply);
      }
    },
  );

  app.post(
    "/vendors/me/stripe/onboard",
    { preHandler: [authenticate, requireRoles(UserRole.VENDOR)] },
    async (request, reply) => {
      try {
        const link = await createVendorStripeOnboardingLink(request.authUser!.id);
        reply.send(link);
      } catch (error) {
        handlePaymentError(error, reply);
      }
    },
  );
}

export async function stripeWebhookRoutes(app: FastifyInstance) {
  await app.register(async (scope) => {
    scope.addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (_request, body, done) => {
        done(null, body);
      },
    );

    scope.post(
      "/webhooks/stripe",
      { config: { rateLimit: false } },
      async (request, reply) => {
        try {
          const signature = request.headers["stripe-signature"];
          const result = await handleStripeWebhook(
            String(request.body ?? ""),
            Array.isArray(signature) ? signature[0] : (signature ?? null),
          );
          reply.send(result);
        } catch (error) {
          handlePaymentError(error, reply);
        }
      },
    );
  });
}
