import { OrderStatus, PaymentStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { CheckoutInput } from "./cart.schemas.js";
import {
  getActiveCartRow,
  getOrCreateCart,
  type CartItemRecord,
} from "./cart.service.js";
import {
  finalizeVendorCommission,
  loadCommissionContext,
  resolveLineCommission,
  resolveVendorFixedFee,
} from "./commission.service.js";
import {
  sendOrderConfirmationEmail,
  sendVendorNewOrderEmail,
} from "./email.service.js";
import { notifyCheckout } from "./notifications.service.js";
import { recordOrderDocuments } from "./stored-document.service.js";

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
    commissionRate: number;
    commissionAmount: number;
    netToVendor: number;
  }> = [];

  const productIds = [...new Set(cart.items.map((item) => item.productId))];
  const products = (await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, categoryId: true, subcategoryId: true },
  })) as Array<{ id: string; categoryId: string; subcategoryId: string | null }>;
  const productById = new Map(products.map((product) => [product.id, product]));

  const vendorIds = [...new Set(cart.items.map((item) => item.vendorId))];
  const { rulesByVendor, contractPercentByVendor } = await loadCommissionContext(vendorIds);

  for (const item of cart.items) {
    if (item.quantity > item.stock) {
      throw new Error("INSUFFICIENT_STOCK");
    }
    const gross = Number(item.lineTotal);
    const vatRate = Number(item.vatRate);
    const tax = taxFromGross(gross, vatRate);
    const product = productById.get(item.productId);
    const commission = await resolveLineCommission({
      vendorId: item.vendorId,
      categoryId: product?.categoryId ?? null,
      subcategoryId: product?.subcategoryId ?? null,
      gross,
      rules: rulesByVendor.get(item.vendorId) ?? [],
      contractPercent: contractPercentByVendor.get(item.vendorId) ?? null,
    });
    lines.push({
      item,
      gross,
      tax,
      commissionRate: commission.rate,
      commissionAmount: commission.amount,
      netToVendor: commission.net,
    });
  }

  const subtotalGross = Number(
    lines.reduce((sum, line) => sum + line.gross, 0).toFixed(2),
  );
  const taxTotal = Number(
    lines.reduce((sum, line) => sum + line.tax, 0).toFixed(2),
  );

  const vendorIdsUnique = vendorIds;
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
    let marketplaceCommissionTotal = 0;
    let netToVendorsTotal = 0;

    for (const vendorId of vendorIdsUnique) {
      const vendorLines = lines.filter((line) => line.item.vendorId === vendorId);
      const vendorGross = Number(
        vendorLines.reduce((sum, line) => sum + line.gross, 0).toFixed(2),
      );
      const vendorTax = Number(
        vendorLines.reduce((sum, line) => sum + line.tax, 0).toFixed(2),
      );
      const lineCommissionTotal = Number(
        vendorLines.reduce((sum, line) => sum + line.commissionAmount, 0).toFixed(2),
      );
      const breakdown = finalizeVendorCommission({
        vendorGross,
        lineCommissionTotal,
        fixedFee: resolveVendorFixedFee(rulesByVendor.get(vendorId) ?? []),
      });
      marketplaceCommissionTotal += breakdown.marketplaceCommission;
      netToVendorsTotal += breakdown.vendorNetAmount;

      const vendorOrder = await tx.vendorOrder.create({
        data: {
          orderId: created.id,
          vendorId,
          status: "PENDING",
          subtotalGross: vendorGross,
          marketplaceCommission: breakdown.marketplaceCommission,
          otherFees: breakdown.fixedFee,
          taxTotal: vendorTax,
          vendorNetAmount: breakdown.vendorNetAmount,
        },
      });
      vendorOrderIds.set(vendorId, vendorOrder.id);
    }

    await tx.order.update({
      where: { id: created.id },
      data: {
        marketplaceCommission: Number(marketplaceCommissionTotal.toFixed(2)),
        otherFees: 0,
        netToVendorsTotal: Number(netToVendorsTotal.toFixed(2)),
      },
    });

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
          commissionRate: line.commissionRate,
          commissionAmount: line.commissionAmount,
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

  const summary = {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    status: order.status,
    totalAmount: String(order.totalAmount),
    taxTotal: String(order.taxTotal),
    subtotalGross: String(order.subtotalGross),
    vendorCount: vendorIdsUnique.length,
    createdAt: order.createdAt,
  };

  recordOrderDocuments(order.id).catch((err: unknown) =>
    console.error("[STORED_DOC] order record failed", err),
  );

  // Notificación Telegram post-checkout (best-effort)
  notifyCheckout({
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: `${input.customerFirstName} ${input.customerLastName ?? ""}`.trim(),
    totalAmount: String(order.totalAmount),
    vendorCount: vendorIdsUnique.length,
    itemCount: lines.reduce((sum, l) => sum + l.item.quantity, 0),
  });

  // Emails post-checkout (best-effort: no bloquean si fallan)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const orderUrl = `${appUrl}/pedido/${order.orderNumber}`;

  sendOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    customerFirstName: input.customerFirstName,
    customerEmail: order.customerEmail,
    totalAmount: String(order.totalAmount),
    items: lines.map((l) => ({
      productName: l.item.productName,
      variantLabel: l.item.variantLabel,
      quantity: l.item.quantity,
      subtotalGross: String(l.gross),
    })),
    shippingAddress: input.shipping,
    orderUrl,
  }).catch((err: unknown) => console.error("[EMAIL] orderConfirmation failed", err));

  // Notificar a cada artesano involucrado
  const vendorEmailsById = await prisma.vendor.findMany({
    where: { id: { in: vendorIdsUnique } },
    select: { id: true, tradeName: true, email: true, user: { select: { email: true } } },
  });

  for (const vendor of vendorEmailsById) {
    const vendorLines = lines.filter((l) => l.item.vendorId === vendor.id);
    const vendorEmail = vendor.email ?? vendor.user?.email;
    if (!vendorEmail) continue;

    sendVendorNewOrderEmail({
      orderNumber: order.orderNumber,
      vendorTradeName: vendor.tradeName,
      vendorEmail,
      items: vendorLines.map((l) => ({
        productName: l.item.productName,
        variantLabel: l.item.variantLabel,
        quantity: l.item.quantity,
      })),
      shippingAddress: input.shipping,
      panelUrl: `${appUrl}/panel/proveedor/pedidos`,
    }).catch((err: unknown) => console.error("[EMAIL] vendorNewOrder failed", err));
  }

  return summary;
}
