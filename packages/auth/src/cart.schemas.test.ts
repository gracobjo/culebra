import { describe, expect, it } from "vitest";

import { addCartItemSchema, checkoutSchema } from "./cart.schemas.js";

const validCheckout = {
  customerEmail: "cliente@example.com",
  customerPhone: "600123456",
  customerFirstName: "Maria",
  customerLastName: "Lopez",
  shipping: {
    firstName: "Maria",
    lastName: "Lopez",
    street: "Calle Mayor 1",
    city: "Villardeciervos",
    province: "Zamora",
    postalCode: "49220",
    country: "ES",
  },
};

describe("cart schemas", () => {
  it("addCartItemSchema valida cantidades", () => {
    expect(addCartItemSchema.safeParse({ productId: "p1", quantity: 0 }).success).toBe(
      false,
    );
    expect(addCartItemSchema.safeParse({ productId: "p1", quantity: 2 }).success).toBe(
      true,
    );
  });

  it("checkoutSchema acepta un flujo de compra minimo", () => {
    const parsed = checkoutSchema.safeParse(validCheckout);
    expect(parsed.success).toBe(true);
  });

  it("checkoutSchema rechaza email invalido", () => {
    const parsed = checkoutSchema.safeParse({
      ...validCheckout,
      customerEmail: "no-es-email",
    });
    expect(parsed.success).toBe(false);
  });
});
