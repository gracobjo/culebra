import { ProductStatus, VendorStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { AddCartItemInput } from "./cart.schemas.js";
import { generateSecureToken } from "./token.js";

export type CartItemRecord = {
  id: string;
  productId: string;
  variantId: string | null;
  vendorId: string;
  quantity: number;
  unitPrice: string;
  vatRate: string;
  lineTotal: string;
  productName: string;
  variantLabel: string | null;
  vendorName: string;
  slug: string;
  imageUrl: string | null;
  stock: number;
};

export type CartRecord = {
  id: string;
  sessionId: string | null;
  itemCount: number;
  subtotal: string;
  items: CartItemRecord[];
};

type CartOwner = {
  userId?: string;
  sessionId?: string;
};

function decimalToString(value: unknown): string {
  if (value == null) {
    return "0";
  }
  return String(value);
}

function lineTotal(unitPrice: unknown, quantity: number): string {
  return (Number(unitPrice) * quantity).toFixed(2);
}

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
          vendor: { select: { tradeName: true, status: true } },
          inventory: true,
        },
      },
      variant: {
        include: { inventory: true },
      },
    },
  },
};

function mapCart(cart: {
  id: string;
  sessionId: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    vendorId: string;
    quantity: number;
    unitPriceSnapshot: unknown;
    vatRateSnapshot: unknown;
    product: {
      name: string;
      slug: string;
      images: Array<{ url: string }>;
      vendor: { tradeName: string };
      inventory: Array<{ stock: number; variantId: string | null }>;
    };
    variant: {
      label: string;
      inventory: Array<{ stock: number }>;
    } | null;
  }>;
}): CartRecord {
  const items = cart.items.map((item) => {
    const stock = item.variant
      ? item.variant.inventory.reduce((sum, row) => sum + row.stock, 0)
      : item.product.inventory
          .filter((row) => !row.variantId)
          .reduce((sum, row) => sum + row.stock, 0);

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      vendorId: item.vendorId,
      quantity: item.quantity,
      unitPrice: decimalToString(item.unitPriceSnapshot),
      vatRate: decimalToString(item.vatRateSnapshot),
      lineTotal: lineTotal(item.unitPriceSnapshot, item.quantity),
      productName: item.product.name,
      variantLabel: item.variant?.label ?? null,
      vendorName: item.product.vendor.tradeName,
      slug: item.product.slug,
      imageUrl: item.product.images[0]?.url ?? null,
      stock,
    };
  });

  const subtotal = items
    .reduce((sum, item) => sum + Number(item.lineTotal), 0)
    .toFixed(2);

  return {
    id: cart.id,
    sessionId: cart.sessionId,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    items,
  };
}

export function createCartSessionId(): string {
  return generateSecureToken(16);
}

export async function getOrCreateCart(owner: CartOwner): Promise<CartRecord> {
  if (!owner.userId && !owner.sessionId) {
    throw new Error("CART_OWNER_REQUIRED");
  }

  if (owner.userId && owner.sessionId) {
    await mergeGuestCart(owner.userId, owner.sessionId);
  }

  const where = owner.userId
    ? { userId: owner.userId, status: "ACTIVE" as const }
    : { sessionId: owner.sessionId, status: "ACTIVE" as const };

  let cart = await prisma.cart.findFirst({
    where,
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: owner.userId,
        sessionId: owner.userId ? null : owner.sessionId,
        status: "ACTIVE",
      },
      include: cartInclude,
    });
  }

  return mapCart(cart);
}

async function mergeGuestCart(userId: string, sessionId: string) {
  const guest = await prisma.cart.findFirst({
    where: { sessionId, status: "ACTIVE" },
    include: { items: true },
  });
  if (!guest || guest.userId === userId) {
    return;
  }

  let userCart = await prisma.cart.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { items: true },
  });

  if (!userCart) {
    await prisma.cart.update({
      where: { id: guest.id },
      data: { userId, sessionId: null },
    });
    return;
  }

  type MergeItem = {
    id: string;
    productId: string;
    variantId: string | null;
    vendorId: string;
    quantity: number;
    unitPriceSnapshot: unknown;
    vatRateSnapshot: unknown;
  };
  const userItems: MergeItem[] = [...(userCart.items as MergeItem[])];

  for (const item of guest.items as MergeItem[]) {
    const existing = userItems.find(
      (row) => row.productId === item.productId && row.variantId === item.variantId,
    );
    if (existing) {
      existing.quantity += item.quantity;
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity },
      });
    } else {
      const created = await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          vendorId: item.vendorId,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceSnapshot,
          vatRateSnapshot: item.vatRateSnapshot,
        },
      });
      userItems.push({
        id: created.id,
        productId: created.productId,
        variantId: created.variantId,
        vendorId: created.vendorId,
        quantity: created.quantity,
        unitPriceSnapshot: created.unitPriceSnapshot,
        vatRateSnapshot: created.vatRateSnapshot,
      });
    }
  }

  await prisma.cart.update({
    where: { id: guest.id },
    data: { status: "ABANDONED", sessionId: null },
  });
}

export async function addCartItem(
  owner: CartOwner,
  input: AddCartItemInput,
): Promise<CartRecord> {
  const cart = await getOrCreateCart(owner);

  const product = await prisma.product.findFirst({
    where: {
      id: input.productId,
      status: ProductStatus.PUBLISHED,
      deletedAt: null,
      vendor: { status: VendorStatus.ACTIVE, deletedAt: null },
    },
    include: {
      variants: { include: { inventory: true } },
      inventory: true,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_AVAILABLE");
  }

  let unitPrice = product.basePrice;
  let stock = product.inventory
    .filter((row: { variantId: string | null }) => !row.variantId)
    .reduce((sum: number, row: { stock: number }) => sum + row.stock, 0);

  if (input.variantId) {
    const variant = product.variants.find(
      (row: { id: string }) => row.id === input.variantId,
    );
    if (!variant || !variant.isActive) {
      throw new Error("VARIANT_NOT_AVAILABLE");
    }
    unitPrice = variant.price;
    stock = variant.inventory.reduce(
      (sum: number, row: { stock: number }) => sum + row.stock,
      0,
    );
  } else if (product.variants.length > 0) {
    throw new Error("VARIANT_REQUIRED");
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });

  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (nextQuantity > stock) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: nextQuantity,
        unitPriceSnapshot: unitPrice,
        vatRateSnapshot: product.vatRate,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId,
        vendorId: product.vendorId,
        quantity: input.quantity,
        unitPriceSnapshot: unitPrice,
        vatRateSnapshot: product.vatRate,
      },
    });
  }

  return getOrCreateCart(owner);
}

export async function updateCartItem(
  owner: CartOwner,
  itemId: string,
  quantity: number,
): Promise<CartRecord> {
  const cart = await getOrCreateCart(owner);
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) {
    throw new Error("CART_ITEM_NOT_FOUND");
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return getOrCreateCart(owner);
  }

  const mapped = cart.items.find((row) => row.id === itemId);
  if (mapped && quantity > mapped.stock) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getOrCreateCart(owner);
}

export async function removeCartItem(
  owner: CartOwner,
  itemId: string,
): Promise<CartRecord> {
  return updateCartItem(owner, itemId, 0);
}

export async function getActiveCartRow(owner: CartOwner) {
  if (!owner.userId && !owner.sessionId) {
    return null;
  }
  return prisma.cart.findFirst({
    where: owner.userId
      ? { userId: owner.userId, status: "ACTIVE" }
      : { sessionId: owner.sessionId, status: "ACTIVE" },
    include: cartInclude,
  });
}
