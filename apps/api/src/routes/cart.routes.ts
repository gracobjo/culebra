import type { FastifyInstance, FastifyReply } from "fastify";
import {
  addCartItem,
  addCartItemSchema,
  checkoutCart,
  checkoutSchema,
  createCartSessionId,
  getOrCreateCart,
  removeCartItem,
  updateCartItem,
  updateCartItemSchema,
} from "@culebra/auth";

import { config } from "../lib/config.js";
import { optionalAuthenticate } from "../middleware/authenticate.js";

function cartOwner(request: {
  authUser?: { id: string };
  cookies: Record<string, string | undefined>;
}) {
  return {
    userId: request.authUser?.id,
    sessionId: request.cookies[config.cartCookieName],
  };
}

function ensureGuestCookie(
  request: { authUser?: { id: string }; cookies: Record<string, string | undefined> },
  reply: FastifyReply,
): string | undefined {
  if (request.authUser?.id) {
    return request.cookies[config.cartCookieName];
  }
  const existing = request.cookies[config.cartCookieName];
  if (existing) {
    return existing;
  }
  const sessionId = createCartSessionId();
  reply.setCookie(config.cartCookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return sessionId;
}

function handleCartError(error: unknown, reply: FastifyReply) {
  if (!(error instanceof Error)) {
    reply.code(500).send({ error: "INTERNAL_ERROR" });
    return;
  }
  const map: Record<string, number> = {
    CART_OWNER_REQUIRED: 400,
    CART_EMPTY: 400,
    CART_ITEM_NOT_FOUND: 404,
    PRODUCT_NOT_AVAILABLE: 400,
    VARIANT_NOT_AVAILABLE: 400,
    VARIANT_REQUIRED: 400,
    INSUFFICIENT_STOCK: 409,
  };
  reply.code(map[error.message] ?? 500).send({ error: error.message });
}

export async function cartRoutes(app: FastifyInstance) {
  app.get("/cart", { preHandler: optionalAuthenticate }, async (request, reply) => {
    const owner = cartOwner(request);
    if (!owner.userId && !owner.sessionId) {
      reply.send({ cart: { id: null, itemCount: 0, subtotal: "0.00", items: [] } });
      return;
    }
    try {
      const cart = await getOrCreateCart(owner);
      reply.send({ cart });
    } catch (error) {
      handleCartError(error, reply);
    }
  });

  app.post("/cart/items", { preHandler: optionalAuthenticate }, async (request, reply) => {
    const parsed = addCartItemSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
      return;
    }
    try {
      const sessionId = ensureGuestCookie(request, reply);
      const cart = await addCartItem(
        { userId: request.authUser?.id, sessionId },
        parsed.data,
      );
      reply.code(201).send({ cart });
    } catch (error) {
      handleCartError(error, reply);
    }
  });

  app.patch("/cart/items/:id", { preHandler: optionalAuthenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateCartItemSchema.safeParse({
      itemId: id,
      ...(request.body as object),
    });
    if (!parsed.success) {
      reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
      return;
    }
    try {
      const cart = await updateCartItem(cartOwner(request), parsed.data.itemId, parsed.data.quantity);
      reply.send({ cart });
    } catch (error) {
      handleCartError(error, reply);
    }
  });

  app.delete("/cart/items/:id", { preHandler: optionalAuthenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const cart = await removeCartItem(cartOwner(request), id);
      reply.send({ cart });
    } catch (error) {
      handleCartError(error, reply);
    }
  });

  app.post("/checkout", { preHandler: optionalAuthenticate }, async (request, reply) => {
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });
      return;
    }
    try {
      const owner = cartOwner(request);
      const order = await checkoutCart(owner, parsed.data);
      reply.code(201).send({ order });
    } catch (error) {
      handleCartError(error, reply);
    }
  });
}
