import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@culebra/db", () => ({
  prisma: {
    $queryRaw: vi.fn().mockRejectedValue(new Error("db offline in tests")),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

import type { FastifyInstance } from "fastify";

import { buildApp } from "./app.js";

describe("API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health expone el servicio", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.service).toBe("culebra-api");
    expect(body.phase).toBe(16);
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("disconnected");
  });

  it("POST /auth/register rechaza payload invalido", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: "correo-invalido",
        password: "123",
      },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("VALIDATION_ERROR");
  });

  it("POST /cart/items rechaza cantidad invalida", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/cart/items",
      payload: {
        productId: "prod_1",
        quantity: 0,
      },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("VALIDATION_ERROR");
  });

  it("GET /admin/dashboard exige autenticacion", async () => {
    const response = await app.inject({ method: "GET", url: "/admin/dashboard" });
    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UNAUTHORIZED");
  });

  it("GET /cart responde carrito vacio para invitado", async () => {
    const response = await app.inject({ method: "GET", url: "/cart" });
    expect(response.statusCode).toBe(200);
    expect(response.json().cart.itemCount).toBe(0);
  });
});
