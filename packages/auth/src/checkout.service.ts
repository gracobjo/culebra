import { OrderStatus, PaymentStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { CheckoutInput } from "./cart.schemas.js";
import {
  getActiveCartRow,
  getOrCreateCart,
  type CartItemRecord,
} from "./cart.service.js";

type CartOwner = {
  userId?: string;
  sessionId?: string;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  taxTotal: string;
  subtotalGross: string;
  vendorCount: number;
  createdAt: Date;
};

function taxFromGross(gross: number, vatRate: number): number {
  return Number(((gross * vatRate) / (100 + vatRate)).toFixed(2));
}

async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `CUL-${String(1000 + count)}`;
}

export async function checkoutCart(
  owner: CartOwner,
  input: CheckoutInput,
): Promise<OrderSummary> {
  const cart = await getOrCreateCart(owner);
  if (cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const billing =
    input.billingSameAsShipping || !input.billing ? input.shipping : input.billing;

  const lines: Array<{
    item: CartItemRecord;
    gross: number;
    tax: number;
    netToVendor: number;
  }> = [];
  for (const item of cart.items) {
    if (item.quantity > item.stock) {
      throw new Error("INSUFFICIENT_STOCK");
    }
    const gross = Number(item.lineTotal);
    const vatRate = Number(item.vatRate);
    const tax = taxFromGross(gross, vatRate);
    lines.push({
      item,
      gross,
      tax,
      netToVendor: gross,
    });
  }

  const subtotalGross = Number(
    lines.reduce((sum, line) => sum + line.gross, 0).toFixed(2),
  );
  const taxTotal = Number(
    lines.reduce((sum, line) => sum + line.tax, 0).toFixed(2),
  );

  const vendorIds = [...new Set(lines.map((line) => line.item.vendorId))];
  const orderNumber = await nextOrderNumber();
  const activeCart = await getActiveCartRow(owner);
  if (!activeCart) {
    throw new Error("CART_EMPTY");
  }

  const order = await prisma.$transaction(async (tx: typeof prisma) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: owner.userId,
        customerEmail: input.customerEmail.toLowerCase(),
        customerPhone: input.customerPhone,
        customerFirstName: input.customerFirstName,
        customerLastName: input.customerLastName,
        shippingAddressSnapshot: input.shipping,
        billingAddressSnapshot: billing,
        status: OrderStatus.PAYMENT_PENDING,
        subtotalGross,
        marketplaceCommission: 0,
        otherFees: 0,
        taxTotal,
        totalAmount: subtotalGross,
        netToVendorsTotal: subtotalGross,
        notes: input.notes,
      },
    });

    const vendorOrderIds = new Map<string, string>();

    for (const vendorId of vendorIds) {
      const vendorLines = lines.filter((line) => line.item.vendorId === vendorId);
      const vendorGross = Number(
        vendorLines.reduce((sum, line) => sum + line.gross, 0).toFixed(2),
      );
      const vendorTax = Number(
        vendorLines.reduce((sum, line) => sum + line.tax, 0).toFixed(2),
      );

      const vendorOrder = await tx.vendorOrder.create({
        data: {
          orderId: created.id,
          vendorId,
          status: "PENDING",
          subtotalGross: vendorGross,
          marketplaceCommission: 0,
          otherFees: 0,
          taxTotal: vendorTax,
          vendorNetAmount: vendorGross,
        },
      });
      vendorOrderIds.set(vendorId, vendorOrder.id);
    }

    for (const line of lines) {
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: created.id,
          vendorId: line.item.vendorId,
          productId: line.item.productId,
          variantId: line.item.variantId,
          productName: line.item.productName,
          variantLabel: line.item.variantLabel,
          quantity: line.item.quantity,
          unitPrice: line.item.unitPrice,
          vatRate: line.item.vatRate,
          subtotalGross: line.gross,
          commissionRate: 0,
          commissionAmount: 0,
          vendorNetAmount: line.netToVendor,
        },
      });

      await tx.vendorOrderItem.create({
        data: {
          vendorOrderId: vendorOrderIds.get(line.item.vendorId)!,
          orderItemId: orderItem.id,
        },
      });

      const inventory = await tx.inventory.findFirst({
        where: {
          productId: line.item.productId,
          variantId: line.item.variantId,
        },
      });
      if (inventory) {
        const updated = await tx.inventory.updateMany({
          where: {
            id: inventory.id,
            stock: { gte: line.item.quantity },
          },
          data: { stock: { decrement: line.item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error("INSUFFICIENT_STOCK");
        }
      }
    }

    await tx.payment.create({
      data: {
        orderId: created.id,
        status: PaymentStatus.PAYMENT_PENDING,
        amount: subtotalGross,
        currency: "EUR",
      },
    });

    await tx.cart.update({
      where: { id: activeCart.id },
      data: { status: "CONVERTED", sessionId: null },
    });

    return created;
  });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    status: order.status,
    totalAmount: String(order.totalAmount),
    taxTotal: String(order.taxTotal),
    subtotalGross: String(order.subtotalGross),
    vendorCount: vendorIds.length,
    createdAt: order.createdAt,
  };
}

export type OrderDetail = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  status: string;
  totalAmount: string;
  taxTotal: string;
  subtotalGross: string;
  paymentStatus: string | null;
  vendorCount: number;
  items: Array<{
    id: string;
    productName: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: string;
    subtotalGross: string;
  }>;
  createdAt: Date;
};

export async function getOrderByNumber(
  orderNumber: string,
  access: { userId?: string; guestAccess?: boolean },
): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: {
      items: true,
      vendorOrders: true,
      payment: true,
    },
  });

  if (!order) {
    return null;
  }

  const ownsOrder = Boolean(access.userId && order.userId === access.userId);
  const guestAccess = Boolean(access.guestAccess && !order.userId);
  if (!ownsOrder && !guestAccess) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    status: order.status,
    totalAmount: String(order.totalAmount),
    taxTotal: String(order.taxTotal),
    subtotalGross: String(order.subtotalGross),
    paymentStatus: order.payment?.status ?? null,
    vendorCount: order.vendorOrders.length,
    items: (
      order.items as Array<{
        id: string;
        productName: string;
        variantLabel: string | null;
        quantity: number;
        unitPrice: unknown;
        subtotalGross: unknown;
      }>
    ).map((item) => ({
      id: item.id,
      productName: item.productName,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotalGross: String(item.subtotalGross),
    })),
    createdAt: order.createdAt,
  };
}
