import { prisma } from "@culebra/db";
import type { Prisma } from "@prisma/client";

import type {
  AffiliateUpsertInput,
  ManualShowroomCommissionInput,
  MarkAffiliatePayoutInput,
} from "./affiliate.schemas.js";
import { DEFAULT_COMMISSION_BY_TYPE } from "./affiliate.constants.js";

export type AffiliateCodeRecord = {
  id: string;
  code: string;
  label: string;
  affiliateType: string;
  commissionPct: number;
  accommodationId: string | null;
  accommodationName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  cookieDays: number;
  payoutMinimum: number;
  commissionPending: number;
  commissionPaid: number;
  programStatus: string;
  isActive: boolean;
  clickCount: number;
  orderCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AffiliateCommissionRecord = {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  affiliateLabel: string;
  orderId: string | null;
  orderNumber: string | null;
  commissionType: string;
  baseAmount: number;
  commissionPct: number;
  commissionAmount: number;
  status: string;
  eventDate: string;
  paidAt: Date | null;
  payoutNote: string | null;
  notes: string | null;
  createdAt: Date;
};

export type AffiliateProgramSummary = {
  activeAffiliates: number;
  pendingCommissions: number;
  pendingAmount: number;
  paidThisYear: number;
  ordersAttributed: number;
};

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function toNumber(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function mapAffiliate(row: {
  id: string;
  code: string;
  label: string;
  affiliateType: string;
  commissionPct: Prisma.Decimal;
  accommodationId: string | null;
  vendorId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  cookieDays: number;
  payoutMinimum: Prisma.Decimal;
  commissionPending: Prisma.Decimal;
  commissionPaid: Prisma.Decimal;
  programStatus: string;
  isActive: boolean;
  clickCount: number;
  orderCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  accommodation?: { name: string } | null;
  vendor?: { tradeName: string } | null;
}): AffiliateCodeRecord {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    affiliateType: row.affiliateType,
    commissionPct: toNumber(row.commissionPct),
    accommodationId: row.accommodationId,
    accommodationName: row.accommodation?.name ?? null,
    vendorId: row.vendorId,
    vendorName: row.vendor?.tradeName ?? null,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    cookieDays: row.cookieDays,
    payoutMinimum: toNumber(row.payoutMinimum),
    commissionPending: toNumber(row.commissionPending),
    commissionPaid: toNumber(row.commissionPaid),
    programStatus: row.programStatus,
    isActive: row.isActive,
    clickCount: row.clickCount,
    orderCount: row.orderCount,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCommission(row: {
  id: string;
  affiliateId: string;
  orderId: string | null;
  orderNumber: string | null;
  commissionType: string;
  baseAmount: Prisma.Decimal;
  commissionPct: Prisma.Decimal;
  commissionAmount: Prisma.Decimal;
  status: string;
  eventDate: Date;
  paidAt: Date | null;
  payoutNote: string | null;
  notes: string | null;
  createdAt: Date;
  affiliate: { code: string; label: string };
}): AffiliateCommissionRecord {
  return {
    id: row.id,
    affiliateId: row.affiliateId,
    affiliateCode: row.affiliate.code,
    affiliateLabel: row.affiliate.label,
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    commissionType: row.commissionType,
    baseAmount: toNumber(row.baseAmount),
    commissionPct: toNumber(row.commissionPct),
    commissionAmount: toNumber(row.commissionAmount),
    status: row.status,
    eventDate: row.eventDate.toISOString().slice(0, 10),
    paidAt: row.paidAt,
    payoutNote: row.payoutNote,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

const affiliateInclude = {
  accommodation: { select: { name: true } },
  vendor: { select: { tradeName: true } },
} as const;

export async function getActiveAffiliateByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const row = await prisma.affiliateCode.findUnique({
    where: { code: normalized },
    include: affiliateInclude,
  });
  if (!row || !row.isActive || row.programStatus !== "ACTIVE") return null;
  return mapAffiliate(row);
}

export async function trackAffiliateClick(code: string) {
  const affiliate = await getActiveAffiliateByCode(code);
  if (!affiliate) return null;
  await prisma.affiliateCode.update({
    where: { id: affiliate.id },
    data: { clickCount: { increment: 1 } },
  });
  return affiliate;
}

export async function incrementAffiliateOrderCount(code: string) {
  const affiliate = await getActiveAffiliateByCode(code);
  if (!affiliate) return;
  await prisma.affiliateCode.update({
    where: { id: affiliate.id },
    data: { orderCount: { increment: 1 } },
  });
}

export async function listAffiliateCodesForAdmin() {
  const rows = await prisma.affiliateCode.findMany({
    orderBy: { createdAt: "desc" },
    include: affiliateInclude,
  });
  return rows.map(mapAffiliate);
}

export async function upsertAffiliateCodeForAdmin(
  input: AffiliateUpsertInput,
  id?: string,
): Promise<AffiliateCodeRecord> {
  const commissionPct =
    input.commissionPct > 0
      ? input.commissionPct
      : DEFAULT_COMMISSION_BY_TYPE[input.affiliateType];

  const data = {
    code: input.code,
    label: input.label,
    affiliateType: input.affiliateType,
    commissionPct,
    accommodationId: emptyToNull(input.accommodationId),
    vendorId: emptyToNull(input.vendorId),
    contactEmail: emptyToNull(input.contactEmail),
    contactPhone: emptyToNull(input.contactPhone),
    cookieDays: input.cookieDays,
    payoutMinimum: input.payoutMinimum,
    programStatus: input.programStatus,
    isActive: input.isActive,
    notes: emptyToNull(input.notes),
  };

  const row = id
    ? await prisma.affiliateCode.update({
        where: { id },
        data,
        include: affiliateInclude,
      })
    : await prisma.affiliateCode.create({
        data,
        include: affiliateInclude,
      });

  return mapAffiliate(row);
}

async function calculateEligibleOrderBase(orderId: string, excludeVendorId: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return 0;

  let eligibleSubtotal = 0;
  for (const item of order.items) {
    if (excludeVendorId && item.vendorId === excludeVendorId) continue;
    eligibleSubtotal += toNumber(item.subtotalGross);
  }

  const orderSubtotal = toNumber(order.subtotalGross);
  const discount = toNumber(order.discountAmount);
  if (discount > 0 && orderSubtotal > 0 && eligibleSubtotal > 0) {
    const discountShare = (eligibleSubtotal / orderSubtotal) * discount;
    eligibleSubtotal = Math.max(0, eligibleSubtotal - discountShare);
  }

  return roundMoney(eligibleSubtotal);
}

export async function recordAffiliateCommissionForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      affiliateCode: true,
      status: true,
    },
  });
  if (!order?.affiliateCode) return null;

  const existing = await prisma.affiliateCommission.findUnique({
    where: { orderId },
  });
  if (existing) return mapCommission(await loadCommission(existing.id));

  const affiliateRow = await prisma.affiliateCode.findUnique({
    where: { code: order.affiliateCode },
  });
  if (!affiliateRow || !affiliateRow.isActive || affiliateRow.programStatus !== "ACTIVE") {
    return null;
  }

  const baseAmount = await calculateEligibleOrderBase(orderId, affiliateRow.vendorId);
  if (baseAmount <= 0) return null;

  const commissionPct = toNumber(affiliateRow.commissionPct);
  const commissionAmount = roundMoney((baseAmount * commissionPct) / 100);

  const created = await prisma.$transaction(async (tx) => {
    const commission = await tx.affiliateCommission.create({
      data: {
        affiliateId: affiliateRow.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        commissionType: "ONLINE_ORDER",
        baseAmount,
        commissionPct,
        commissionAmount,
        status: "PENDING",
        eventDate: new Date(),
      },
      include: { affiliate: { select: { code: true, label: true } } },
    });

    await tx.affiliateCode.update({
      where: { id: affiliateRow.id },
      data: { commissionPending: { increment: commissionAmount } },
    });

    return commission;
  });

  return mapCommission(created);
}

async function loadCommission(id: string) {
  return prisma.affiliateCommission.findUniqueOrThrow({
    where: { id },
    include: { affiliate: { select: { code: true, label: true } } },
  });
}

export async function registerManualShowroomCommissionForAdmin(
  input: ManualShowroomCommissionInput,
) {
  const affiliateRow = await prisma.affiliateCode.findUnique({
    where: { id: input.affiliateId },
  });
  if (!affiliateRow) throw new Error("Afiliado no encontrado");

  const commissionPct = input.commissionPct ?? toNumber(affiliateRow.commissionPct);
  const baseAmount = roundMoney(input.baseAmount);
  const commissionAmount = roundMoney((baseAmount * commissionPct) / 100);

  const created = await prisma.$transaction(async (tx) => {
    const commission = await tx.affiliateCommission.create({
      data: {
        affiliateId: affiliateRow.id,
        commissionType: "SHOWROOM_SALE",
        baseAmount,
        commissionPct,
        commissionAmount,
        status: "PENDING",
        eventDate: new Date(),
        notes: emptyToNull(input.notes),
      },
      include: { affiliate: { select: { code: true, label: true } } },
    });

    await tx.affiliateCode.update({
      where: { id: affiliateRow.id },
      data: { commissionPending: { increment: commissionAmount } },
    });

    return commission;
  });

  return mapCommission(created);
}

export async function markAffiliateCommissionsPaidForAdmin(input: MarkAffiliatePayoutInput) {
  const commissions = await prisma.affiliateCommission.findMany({
    where: {
      id: { in: input.commissionIds },
      affiliateId: input.affiliateId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });
  if (commissions.length === 0) return { paidCount: 0, paidAmount: 0 };

  const total = roundMoney(
    commissions.reduce((sum, row) => sum + toNumber(row.commissionAmount), 0),
  );

  await prisma.$transaction(async (tx) => {
    await tx.affiliateCommission.updateMany({
      where: { id: { in: commissions.map((row) => row.id) } },
      data: {
        status: "PAID",
        paidAt: new Date(),
        payoutNote: emptyToNull(input.payoutNote),
      },
    });

    await tx.affiliateCode.update({
      where: { id: input.affiliateId },
      data: {
        commissionPending: { decrement: total },
        commissionPaid: { increment: total },
      },
    });
  });

  return { paidCount: commissions.length, paidAmount: total };
}

export async function cancelAffiliateCommissionForAdmin(commissionId: string) {
  const commission = await prisma.affiliateCommission.findUnique({
    where: { id: commissionId },
  });
  if (!commission || commission.status === "PAID" || commission.status === "CANCELLED") {
    return null;
  }

  const amount = toNumber(commission.commissionAmount);

  await prisma.$transaction(async (tx) => {
    await tx.affiliateCommission.update({
      where: { id: commissionId },
      data: { status: "CANCELLED" },
    });
    await tx.affiliateCode.update({
      where: { id: commission.affiliateId },
      data: { commissionPending: { decrement: amount } },
    });
  });

  return true;
}

export async function listAffiliateCommissionsForAdmin(params?: {
  affiliateId?: string;
  status?: string;
  limit?: number;
}) {
  const rows = await prisma.affiliateCommission.findMany({
    where: {
      ...(params?.affiliateId ? { affiliateId: params.affiliateId } : {}),
      ...(params?.status ? { status: params.status as never } : {}),
    },
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
    take: params?.limit ?? 100,
    include: { affiliate: { select: { code: true, label: true } } },
  });
  return rows.map(mapCommission);
}

export async function getAffiliateProgramSummary(): Promise<AffiliateProgramSummary> {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [activeAffiliates, pendingAgg, paidAgg, ordersAttributed] = await Promise.all([
    prisma.affiliateCode.count({
      where: { isActive: true, programStatus: "ACTIVE" },
    }),
    prisma.affiliateCommission.aggregate({
      where: { status: { in: ["PENDING", "APPROVED"] } },
      _count: true,
      _sum: { commissionAmount: true },
    }),
    prisma.affiliateCommission.aggregate({
      where: { status: "PAID", paidAt: { gte: yearStart } },
      _sum: { commissionAmount: true },
    }),
    prisma.affiliateCommission.count({
      where: { commissionType: "ONLINE_ORDER", status: { not: "CANCELLED" } },
    }),
  ]);

  return {
    activeAffiliates,
    pendingCommissions: pendingAgg._count,
    pendingAmount: toNumber(pendingAgg._sum.commissionAmount ?? 0),
    paidThisYear: toNumber(paidAgg._sum.commissionAmount ?? 0),
    ordersAttributed,
  };
}

function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function exportAffiliateCommissionsCsvForAdmin(params?: {
  affiliateId?: string;
  from?: string;
  to?: string;
}) {
  const fromDate = params?.from ? new Date(params.from) : undefined;
  const toDate = params?.to ? new Date(params.to) : undefined;

  const rows = await prisma.affiliateCommission.findMany({
    where: {
      ...(params?.affiliateId ? { affiliateId: params.affiliateId } : {}),
      ...(fromDate || toDate
        ? {
            eventDate: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
    include: { affiliate: { select: { code: true, label: true } } },
  });

  const header = [
    "fecha",
    "codigo_afiliado",
    "nombre_afiliado",
    "tipo",
    "pedido",
    "base_eur",
    "pct",
    "comision_eur",
    "estado",
    "notas",
  ].join(",");

  const lines = rows.map((row) =>
    [
      row.eventDate.toISOString().slice(0, 10),
      csvEscape(row.affiliate.code),
      csvEscape(row.affiliate.label),
      csvEscape(row.commissionType),
      csvEscape(row.orderNumber),
      toNumber(row.baseAmount).toFixed(2),
      toNumber(row.commissionPct).toFixed(2),
      toNumber(row.commissionAmount).toFixed(2),
      csvEscape(row.status),
      csvEscape(row.notes),
    ].join(","),
  );

  return `\uFEFF${header}\n${lines.join("\n")}\n`;
}
