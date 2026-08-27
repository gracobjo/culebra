import { prisma } from "@culebra/db";
import { toInputJsonValue } from "./prisma-helpers.js";

export type StoredDocumentKind = "ORDER_CUSTOMER" | "ORDER_VENDOR" | "PRODUCT_CHANGE";

export type StoredDocumentRecord = {
  id: string;
  kind: StoredDocumentKind;
  ownerUserId: string | null;
  entityType: string;
  entityId: string;
  title: string;
  snapshot: Record<string, unknown>;
  retentionUntil: Date;
  createdAt: Date;
};

/** Pedidos: 4 años (obligacion contable/fiscal habitual en Espana). */
const ORDER_RETENTION_DAYS = 365 * 4;
/** Cambios de producto: minimo 3 meses si no hay otro plazo legal especifico. */
const PRODUCT_CHANGE_RETENTION_DAYS = 90;

function retentionUntil(kind: StoredDocumentKind): Date {
  const days =
    kind === "PRODUCT_CHANGE" ? PRODUCT_CHANGE_RETENTION_DAYS : ORDER_RETENTION_DAYS;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function mapRow(row: {
  id: string;
  kind: string;
  ownerUserId: string | null;
  entityType: string;
  entityId: string;
  title: string;
  snapshot: unknown;
  retentionUntil: Date;
  createdAt: Date;
}): StoredDocumentRecord {
  return {
    id: row.id,
    kind: row.kind as StoredDocumentKind,
    ownerUserId: row.ownerUserId,
    entityType: row.entityType,
    entityId: row.entityId,
    title: row.title,
    snapshot: (row.snapshot as Record<string, unknown>) ?? {},
    retentionUntil: row.retentionUntil,
    createdAt: row.createdAt,
  };
}

async function buildOrderSnapshot(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { vendor: { select: { id: true, tradeName: true, userId: true } } } },
      payment: true,
      vendorOrders: {
        include: {
          vendor: { select: { id: true, tradeName: true, userId: true } },
          shipment: true,
          items: { include: { orderItem: true } },
        },
      },
    },
  });
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    customerEmail: order.customerEmail,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    customerPhone: order.customerPhone,
    shippingAddressSnapshot: order.shippingAddressSnapshot,
    billingAddressSnapshot: order.billingAddressSnapshot,
    subtotalGross: String(order.subtotalGross),
    taxTotal: String(order.taxTotal),
    totalAmount: String(order.totalAmount),
    paymentStatus: order.payment?.status ?? null,
    paymentProvider: order.payment?.provider ?? null,
    paymentMetadata: order.payment?.metadata ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantLabel: item.variantLabel,
      vendorId: item.vendorId,
      vendorName: item.vendor.tradeName,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      vatRate: String(item.vatRate),
      subtotalGross: String(item.subtotalGross),
    })),
    vendorOrders: order.vendorOrders.map((vendorOrder) => ({
      id: vendorOrder.id,
      vendorId: vendorOrder.vendorId,
      vendorName: vendorOrder.vendor.tradeName,
      vendorUserId: vendorOrder.vendor.userId,
      status: vendorOrder.status,
      subtotalGross: String(vendorOrder.subtotalGross),
      taxTotal: String(vendorOrder.taxTotal),
      marketplaceCommission: String(vendorOrder.marketplaceCommission),
      vendorNetAmount: String(vendorOrder.vendorNetAmount),
      shipment: vendorOrder.shipment,
      items: vendorOrder.items.map((link) => ({
        productName: link.orderItem.productName,
        variantLabel: link.orderItem.variantLabel,
        quantity: link.orderItem.quantity,
        subtotalGross: String(link.orderItem.subtotalGross),
      })),
    })),
  };
}

export async function recordOrderDocuments(orderId: string): Promise<void> {
  const existing = await prisma.storedDocument.findFirst({
    where: { entityType: "Order", entityId: orderId, kind: "ORDER_CUSTOMER" },
  });
  if (existing) {
    return;
  }

  const snapshot = await buildOrderSnapshot(orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, orderNumber: true },
  });
  if (!order) {
    return;
  }

  await prisma.storedDocument.create({
    data: {
      kind: "ORDER_CUSTOMER",
      ownerUserId: order.userId,
      entityType: "Order",
      entityId: orderId,
      title: `Pedido ${order.orderNumber}`,
      snapshot: toInputJsonValue(snapshot),
      retentionUntil: retentionUntil("ORDER_CUSTOMER"),
    },
  });

  const vendorOrders = (snapshot.vendorOrders as Array<{
    id: string;
    vendorName: string;
    vendorUserId: string;
  }>) ?? [];

  for (const vendorOrder of vendorOrders) {
    await prisma.storedDocument.create({
      data: {
        kind: "ORDER_VENDOR",
        ownerUserId: vendorOrder.vendorUserId,
        entityType: "VendorOrder",
        entityId: vendorOrder.id,
        title: `Pedido ${order.orderNumber} · ${vendorOrder.vendorName}`,
        snapshot: toInputJsonValue({
          ...snapshot,
          vendorOrderId: vendorOrder.id,
          vendorName: vendorOrder.vendorName,
        }),
        retentionUntil: retentionUntil("ORDER_VENDOR"),
      },
    });
  }
}

export async function recordProductChangeDocument(params: {
  userId: string;
  productId: string;
  productName: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  changedFields: string[];
}): Promise<StoredDocumentRecord> {
  const snapshot = {
    productId: params.productId,
    productName: params.productName,
    changedAt: new Date().toISOString(),
    actorUserId: params.userId,
    changedFields: params.changedFields,
    before: params.before,
    after: params.after,
    retentionPolicyDays: PRODUCT_CHANGE_RETENTION_DAYS,
  };

  const row = await prisma.storedDocument.create({
    data: {
      kind: "PRODUCT_CHANGE",
      ownerUserId: params.userId,
      entityType: "Product",
      entityId: params.productId,
      title: `Cambio en ${params.productName}`,
      snapshot: toInputJsonValue(snapshot),
      retentionUntil: retentionUntil("PRODUCT_CHANGE"),
    },
  });

  return mapRow(row);
}

export async function listStoredDocumentsForUser(
  userId: string,
  kind?: StoredDocumentKind,
): Promise<StoredDocumentRecord[]> {
  const rows = await prisma.storedDocument.findMany({
    where: {
      ownerUserId: userId,
      retentionUntil: { gt: new Date() },
      ...(kind ? { kind } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(mapRow);
}

export async function listProductChangeDocuments(
  userId: string,
  productId: string,
): Promise<StoredDocumentRecord[]> {
  const product = await prisma.product.findFirst({
    where: { id: productId, vendor: { userId } },
    select: { id: true },
  });
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const rows = await prisma.storedDocument.findMany({
    where: {
      kind: "PRODUCT_CHANGE",
      entityType: "Product",
      entityId: productId,
      retentionUntil: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map(mapRow);
}

export async function getStoredDocumentForOwner(
  documentId: string,
  userId: string,
): Promise<StoredDocumentRecord | null> {
  const row = await prisma.storedDocument.findFirst({
    where: {
      id: documentId,
      ownerUserId: userId,
      retentionUntil: { gt: new Date() },
    },
  });
  return row ? mapRow(row) : null;
}

export async function getStoredDocumentForAdmin(
  documentId: string,
): Promise<StoredDocumentRecord | null> {
  const row = await prisma.storedDocument.findFirst({
    where: {
      id: documentId,
      retentionUntil: { gt: new Date() },
    },
  });
  return row ? mapRow(row) : null;
}

export async function purgeExpiredStoredDocuments(): Promise<number> {
  const result = await prisma.storedDocument.deleteMany({
    where: { retentionUntil: { lte: new Date() } },
  });
  return result.count;
}

export function productSnapshotFromRecord(product: {
  name: string;
  basePrice: string;
  vatRate: string;
  stock: number;
  status: string;
  shortDescription: string | null;
  ingredients: string | null;
  allergens: string | null;
  origin: string | null;
  unit: string | null;
}): Record<string, unknown> {
  return {
    name: product.name,
    basePrice: product.basePrice,
    vatRate: product.vatRate,
    stock: product.stock,
    status: product.status,
    shortDescription: product.shortDescription,
    ingredients: product.ingredients,
    allergens: product.allergens,
    origin: product.origin,
    unit: product.unit,
  };
}

export function diffProductSnapshots(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
}
