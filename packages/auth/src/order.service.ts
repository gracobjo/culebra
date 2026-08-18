import { AuditAction, OrderStatus, PaymentStatus, ShipmentStatus, VendorOrderStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import { getVendorByUserId } from "./vendor.service.js";
import type { ShipVendorOrderInput, VendorOrderStatusInput } from "./order.schemas.js";
import { isStripeConfigured } from "./stripe.js";

type AddressSnapshot = {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  company?: string;
};

export type OrderItemView = {
  id: string;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: string;
  subtotalGross: string;
};

export type VendorOrderView = {
  id: string;
  vendorId: string;
  vendorName: string;
  status: string;
  subtotalGross: string;
  items: OrderItemView[];
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
    shippedAt: Date | null;
    deliveredAt: Date | null;
  } | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  status: string;
  totalAmount: string;
  taxTotal: string;
  subtotalGross: string;
  paymentStatus: string | null;
  vendorCount: number;
  shippingAddress: AddressSnapshot | null;
  items: OrderItemView[];
  vendorOrders: VendorOrderView[];
  createdAt: Date;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  vendorCount: number;
  itemCount: number;
  createdAt: Date;
};

export type VendorOrderDetail = {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  orderStatus: string;
  paymentStatus: string | null;
  subtotalGross: string;
  marketplaceCommission: string;
  vendorNetAmount: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: AddressSnapshot | null;
  notes: string | null;
  items: OrderItemView[];
  shipment: VendorOrderView["shipment"];
  allowedActions: string[];
  createdAt: Date;
};

const vendorOrderInclude = {
  vendor: { select: { tradeName: true } },
  shipment: true,
  items: { include: { orderItem: true } },
  order: {
    include: {
      payment: true,
    },
  },
};

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PREPARATION", "SHIPPED", "CANCELLED"],
  IN_PREPARATION: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};

function decimalToString(value: unknown): string {
  return value == null ? "0" : String(value);
}

function asAddress(value: unknown): AddressSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as AddressSnapshot;
}

function mapOrderItem(item: {
  id: string;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  unitPrice: unknown;
  subtotalGross: unknown;
}): OrderItemView {
  return {
    id: item.id,
    productName: item.productName,
    variantLabel: item.variantLabel,
    quantity: item.quantity,
    unitPrice: decimalToString(item.unitPrice),
    subtotalGross: decimalToString(item.subtotalGross),
  };
}

function mapVendorOrder(row: {
  id: string;
  vendorId: string;
  status: string;
  subtotalGross: unknown;
  vendor?: { tradeName: string };
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
    shippedAt: Date | null;
    deliveredAt: Date | null;
  } | null;
  items: Array<{ orderItem: Parameters<typeof mapOrderItem>[0] }>;
}): VendorOrderView {
  return {
    id: row.id,
    vendorId: row.vendorId,
    vendorName: row.vendor?.tradeName ?? "Productor",
    status: row.status,
    subtotalGross: decimalToString(row.subtotalGross),
    items: row.items.map((item) => mapOrderItem(item.orderItem)),
    shipment: row.shipment
      ? {
          carrier: row.shipment.carrier,
          trackingNumber: row.shipment.trackingNumber,
          status: row.shipment.status,
          shippedAt: row.shipment.shippedAt,
          deliveredAt: row.shipment.deliveredAt,
        }
      : null,
  };
}

function allowedActions(status: string): string[] {
  return allowedTransitions[status] ?? [];
}

function deriveOrderStatus(vendorStatuses: string[], current: string): string {
  if (current === OrderStatus.CANCELLED || current === OrderStatus.REFUNDED) {
    return current;
  }

  const active = vendorStatuses.filter((status) => status !== VendorOrderStatus.CANCELLED);
  if (active.length === 0) {
    return OrderStatus.CANCELLED;
  }
  if (active.every((status) => status === VendorOrderStatus.DELIVERED)) {
    return OrderStatus.DELIVERED;
  }
  if (
    active.every(
      (status) =>
        status === VendorOrderStatus.SHIPPED || status === VendorOrderStatus.DELIVERED,
    )
  ) {
    return OrderStatus.SHIPPED;
  }
  if (
    active.some(
      (status) =>
        status === VendorOrderStatus.SHIPPED || status === VendorOrderStatus.DELIVERED,
    )
  ) {
    return OrderStatus.PARTIALLY_SHIPPED;
  }
  return current;
}

function mapOrderDetail(order: {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string | null;
  customerFirstName: string | null;
  customerLastName: string | null;
  status: string;
  totalAmount: unknown;
  taxTotal: unknown;
  subtotalGross: unknown;
  shippingAddressSnapshot: unknown;
  createdAt: Date;
  items: Parameters<typeof mapOrderItem>[0][];
  vendorOrders: Parameters<typeof mapVendorOrder>[0][];
  payment?: { status: string } | null;
}): OrderDetail {
  const vendorOrders = order.vendorOrders.map(mapVendorOrder);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    status: order.status,
    totalAmount: decimalToString(order.totalAmount),
    taxTotal: decimalToString(order.taxTotal),
    subtotalGross: decimalToString(order.subtotalGross),
    paymentStatus: order.payment?.status ?? null,
    vendorCount: vendorOrders.length,
    shippingAddress: asAddress(order.shippingAddressSnapshot),
    items: order.items.map(mapOrderItem),
    vendorOrders,
    createdAt: order.createdAt,
  };
}

async function writeAuditLog(params: {
  actorUserId?: string;
  entityId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      entityType: "VendorOrder",
      entityId: params.entityId,
      action: params.action,
      metadata: params.metadata,
    },
  });
}

const orderDetailInclude = {
  items: true,
  payment: true,
  vendorOrders: {
    include: {
      vendor: { select: { tradeName: true } },
      shipment: true,
      items: { include: { orderItem: true } },
    },
  },
};

export async function getOrderByNumber(
  orderNumber: string,
  access: { userId?: string; guestAccess?: boolean; email?: string },
): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    include: orderDetailInclude,
  });

  if (!order) {
    return null;
  }

  const ownsOrder = Boolean(access.userId && order.userId === access.userId);
  const guestCookie = Boolean(access.guestAccess);
  const guestEmail = Boolean(
    access.email && order.customerEmail === access.email.toLowerCase(),
  );
  if (!ownsOrder && !guestCookie && !guestEmail) {
    return null;
  }

  return mapOrderDetail(order);
}

export async function lookupGuestOrder(
  orderNumber: string,
  email: string,
): Promise<OrderDetail | null> {
  return getOrderByNumber(orderNumber, { email });
}

export async function listOrdersForUser(userId: string): Promise<OrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true, vendorOrders: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(
    (order: {
      id: string;
      orderNumber: string;
      status: string;
      totalAmount: unknown;
      createdAt: Date;
      items: unknown[];
      vendorOrders: unknown[];
    }) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: decimalToString(order.totalAmount),
      vendorCount: order.vendorOrders.length,
      itemCount: order.items.length,
      createdAt: order.createdAt,
    }),
  );
}

function mapVendorOrderDetail(row: {
  id: string;
  status: string;
  subtotalGross: unknown;
  marketplaceCommission?: unknown;
  vendorNetAmount?: unknown;
  createdAt: Date;
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
    shippedAt: Date | null;
    deliveredAt: Date | null;
  } | null;
  items: Array<{ orderItem: Parameters<typeof mapOrderItem>[0] }>;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerEmail: string;
    customerPhone: string | null;
    customerFirstName: string | null;
    customerLastName: string | null;
    shippingAddressSnapshot: unknown;
    notes: string | null;
    payment?: { status: string } | null;
  };
}): VendorOrderDetail {
  const name = [row.order.customerFirstName, row.order.customerLastName]
    .filter(Boolean)
    .join(" ");
  return {
    id: row.id,
    orderId: row.order.id,
    orderNumber: row.order.orderNumber,
    status: row.status,
    orderStatus: row.order.status,
    paymentStatus: row.order.payment?.status ?? null,
    subtotalGross: decimalToString(row.subtotalGross),
    marketplaceCommission: decimalToString(row.marketplaceCommission),
    vendorNetAmount: decimalToString(row.vendorNetAmount),
    customerName: name || "Cliente",
    customerEmail: row.order.customerEmail,
    customerPhone: row.order.customerPhone,
    shippingAddress: asAddress(row.order.shippingAddressSnapshot),
    notes: row.order.notes,
    items: row.items.map((item) => mapOrderItem(item.orderItem)),
    shipment: row.shipment
      ? {
          carrier: row.shipment.carrier,
          trackingNumber: row.shipment.trackingNumber,
          status: row.shipment.status,
          shippedAt: row.shipment.shippedAt,
          deliveredAt: row.shipment.deliveredAt,
        }
      : null,
    allowedActions: allowedActions(row.status),
    createdAt: row.createdAt,
  };
}

export async function listVendorOrders(userId: string): Promise<VendorOrderDetail[]> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const rows = await prisma.vendorOrder.findMany({
    where: { vendorId: vendor.id },
    include: vendorOrderInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row: Parameters<typeof mapVendorOrderDetail>[0]) =>
    mapVendorOrderDetail(row),
  );
}

export async function getVendorOrder(
  userId: string,
  vendorOrderId: string,
): Promise<VendorOrderDetail> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const row = await prisma.vendorOrder.findFirst({
    where: { id: vendorOrderId, vendorId: vendor.id },
    include: vendorOrderInclude,
  });
  if (!row) {
    throw new Error("VENDOR_ORDER_NOT_FOUND");
  }

  return mapVendorOrderDetail(row);
}

async function restoreStockForVendorOrder(vendorOrderId: string) {
  const links = await prisma.vendorOrderItem.findMany({
    where: { vendorOrderId },
    include: { orderItem: true },
  });

  for (const link of links as Array<{
    orderItem: { productId: string; variantId: string | null; quantity: number };
  }>) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: link.orderItem.productId,
        variantId: link.orderItem.variantId,
      },
    });
    if (inventory) {
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: { stock: { increment: link.orderItem.quantity } },
      });
    }
  }
}

async function syncParentOrderStatus(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { vendorOrders: true },
  });
  if (!order) {
    return;
  }
  const next = deriveOrderStatus(
    (order.vendorOrders as Array<{ status: string }>).map((row) => row.status),
    order.status,
  );
  if (next !== order.status) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: next },
    });
  }
}

export async function updateVendorOrderStatus(
  userId: string,
  vendorOrderId: string,
  input: VendorOrderStatusInput,
): Promise<VendorOrderDetail> {
  const current = await getVendorOrder(userId, vendorOrderId);
  if (!current.allowedActions.includes(input.status)) {
    throw new Error("VENDOR_ORDER_INVALID_STATUS");
  }

  if (
    input.status !== VendorOrderStatus.CANCELLED &&
    isStripeConfigured() &&
    current.paymentStatus !== PaymentStatus.PAYMENT_PAID
  ) {
    throw new Error("VENDOR_ORDER_PAYMENT_REQUIRED");
  }

  if (input.status === VendorOrderStatus.SHIPPED) {
    return shipVendorOrder(userId, vendorOrderId, {
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
    });
  }

  if (input.status === VendorOrderStatus.CANCELLED) {
    await restoreStockForVendorOrder(vendorOrderId);
  }

  const shipmentUpdate =
    input.status === VendorOrderStatus.DELIVERED
      ? {
          status: ShipmentStatus.DELIVERED,
          deliveredAt: new Date(),
        }
      : null;

  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { status: input.status },
  });

  if (shipmentUpdate && current.shipment) {
    await prisma.shipment.update({
      where: { vendorOrderId },
      data: shipmentUpdate,
    });
  } else if (shipmentUpdate) {
    await prisma.shipment.create({
      data: {
        vendorOrderId,
        status: shipmentUpdate.status,
        deliveredAt: shipmentUpdate.deliveredAt,
      },
    });
  }

  await syncParentOrderStatus(current.orderId);
  await writeAuditLog({
    actorUserId: userId,
    entityId: vendorOrderId,
    action: AuditAction.STATUS_CHANGE,
    metadata: { from: current.status, to: input.status },
  });

  return getVendorOrder(userId, vendorOrderId);
}

export async function shipVendorOrder(
  userId: string,
  vendorOrderId: string,
  input: ShipVendorOrderInput,
): Promise<VendorOrderDetail> {
  const current = await getVendorOrder(userId, vendorOrderId);
  if (!current.allowedActions.includes(VendorOrderStatus.SHIPPED)) {
    throw new Error("VENDOR_ORDER_INVALID_STATUS");
  }
  if (
    isStripeConfigured() &&
    current.paymentStatus !== PaymentStatus.PAYMENT_PAID
  ) {
    throw new Error("VENDOR_ORDER_PAYMENT_REQUIRED");
  }

  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: { status: VendorOrderStatus.SHIPPED },
  });

  const shipmentData = {
    carrier: input.carrier || null,
    trackingNumber: input.trackingNumber || null,
    status: ShipmentStatus.SHIPPED,
    shippedAt: new Date(),
  };

  const existing = await prisma.shipment.findFirst({
    where: { vendorOrderId },
  });
  if (existing) {
    await prisma.shipment.update({
      where: { id: existing.id },
      data: shipmentData,
    });
  } else {
    await prisma.shipment.create({
      data: { vendorOrderId, ...shipmentData },
    });
  }

  await syncParentOrderStatus(current.orderId);
  await writeAuditLog({
    actorUserId: userId,
    entityId: vendorOrderId,
    action: AuditAction.STATUS_CHANGE,
    metadata: {
      from: current.status,
      to: VendorOrderStatus.SHIPPED,
      trackingNumber: input.trackingNumber ?? null,
    },
  });

  return getVendorOrder(userId, vendorOrderId);
}
