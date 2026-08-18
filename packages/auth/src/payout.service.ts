import { PayoutStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import { getVendorByUserId } from "./vendor.service.js";

export type PayoutRecord = {
  id: string;
  vendorId: string;
  vendorOrderId: string;
  orderNumber: string;
  status: PayoutStatus;
  amountGross: string;
  commissionMarketplace: string;
  otherFees: string;
  amountNetToVendor: string;
  stripeTransferId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function decimalToString(value: unknown): string {
  return value == null ? "0" : String(value);
}

function mapPayout(row: {
  id: string;
  vendorId: string;
  vendorOrderId: string;
  status: string;
  amountGross: unknown;
  commissionMarketplace: unknown;
  otherFees: unknown;
  amountNetToVendor: unknown;
  stripeTransferId: string | null;
  createdAt: Date;
  updatedAt: Date;
  vendorOrder: { order: { orderNumber: string } };
}): PayoutRecord {
  return {
    id: row.id,
    vendorId: row.vendorId,
    vendorOrderId: row.vendorOrderId,
    orderNumber: row.vendorOrder.order.orderNumber,
    status: row.status as PayoutStatus,
    amountGross: decimalToString(row.amountGross),
    commissionMarketplace: decimalToString(row.commissionMarketplace),
    otherFees: decimalToString(row.otherFees),
    amountNetToVendor: decimalToString(row.amountNetToVendor),
    stripeTransferId: row.stripeTransferId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const payoutInclude = {
  vendorOrder: {
    include: {
      order: { select: { orderNumber: true } },
    },
  },
};

export async function listPayoutsForVendor(
  userId: string,
  params?: { status?: PayoutStatus; limit?: number; offset?: number },
) {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  const where = {
    vendorId: vendor.id,
    ...(params?.status ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: payoutInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payout.count({ where }),
  ]);

  const summary = await prisma.payout.groupBy({
    by: ["status"],
    where: { vendorId: vendor.id },
    _sum: { amountNetToVendor: true, commissionMarketplace: true },
  });

  return {
    items: items.map((item: (typeof items)[number]) =>
      mapPayout(item as Parameters<typeof mapPayout>[0]),
    ),
    total,
    totals: {
      pendingNet: decimalToString(
        summary.find((row: (typeof summary)[number]) => row.status === PayoutStatus.PENDING)
          ?._sum.amountNetToVendor,
      ),
      paidNet: decimalToString(
        summary.find((row: (typeof summary)[number]) => row.status === PayoutStatus.PAID)
          ?._sum.amountNetToVendor,
      ),
      commission: decimalToString(
        summary.reduce(
          (sum: number, row: (typeof summary)[number]) =>
            sum + Number(row._sum.commissionMarketplace ?? 0),
          0,
        ),
      ),
    },
  };
}

export async function listPayoutsForAdmin(params?: {
  vendorId?: string;
  status?: PayoutStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  const where = {
    ...(params?.vendorId ? { vendorId: params.vendorId } : {}),
    ...(params?.status ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: payoutInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.payout.count({ where }),
  ]);

  return {
    items: items.map((item: (typeof items)[number]) =>
      mapPayout(item as Parameters<typeof mapPayout>[0]),
    ),
    total,
  };
}
