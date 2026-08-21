import { prisma } from "@culebra/db";
import type { Prisma } from "@prisma/client";

export const RAPPEL_TIERS = [
  {
    id: "bronze",
    name: "Bronce",
    minRevenue: 0,
    maxRevenue: 5000,
    commissionPct: 17,
    effectivePct: 17,
    rebatePct: 0,
  },
  {
    id: "silver",
    name: "Plata",
    minRevenue: 5001,
    maxRevenue: 15000,
    commissionPct: 17,
    effectivePct: 14,
    rebatePct: 3,
  },
  {
    id: "gold",
    name: "Oro",
    minRevenue: 15001,
    maxRevenue: Infinity,
    commissionPct: 17,
    effectivePct: 12,
    rebatePct: 5,
  },
] as const;

export type RappelTier = (typeof RAPPEL_TIERS)[number];

export type VendorRappelSnapshot = {
  vendorId: string;
  tradeName: string;
  city: string | null;
  annualRevenue: number;
  commissionCharged: number;
  currentTier: RappelTier;
  nextTier: RappelTier | null;
  remainingToNextTier: number;
  /** Importe teórico / congelable: facturación × rebatePct (cláusula). */
  pendingRebate: number;
  effectiveCommission: number;
};

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function euros(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function resolveRappelTier(annualRevenue: number): RappelTier {
  return (
    [...RAPPEL_TIERS].reverse().find((t) => annualRevenue >= t.minRevenue) ?? RAPPEL_TIERS[0]
  );
}

/** Rappel contractual = facturación neta × % del tramo (no cancelados/devueltos). */
export function computeRebateAmount(annualRevenue: number, rebatePct: number) {
  if (rebatePct <= 0 || annualRevenue <= 0) return 0;
  return round2((annualRevenue * rebatePct) / 100);
}

/** Plazo: 60 días naturales tras el 31 de diciembre del año liquidado. */
export function rappelDueAt(year: number): Date {
  return new Date(year + 1, 2, 1); // 1 de marzo (aprox. 60 días)
}

const EXCLUDED_VENDOR_ORDER_STATUSES = ["CANCELLED", "RETURNED"] as const;

export async function getVendorRappelSnapshots(year: number): Promise<VendorRappelSnapshot[]> {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const vendorOrders = await prisma.vendorOrder.groupBy({
    by: ["vendorId"],
    where: {
      createdAt: { gte: start, lt: end },
      status: { notIn: [...EXCLUDED_VENDOR_ORDER_STATUSES] },
    },
    _sum: { subtotalGross: true, marketplaceCommission: true },
  });

  if (vendorOrders.length === 0) return [];

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorOrders.map((v) => v.vendorId) } },
    select: { id: true, tradeName: true, city: true },
  });
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  return vendorOrders.map((vo) => {
    const annualRevenue = Number(vo._sum.subtotalGross ?? 0);
    const commissionCharged = Number(vo._sum.marketplaceCommission ?? 0);
    const vendor = vendorMap.get(vo.vendorId);
    const currentTier = resolveRappelTier(annualRevenue);
    const tierIndex = RAPPEL_TIERS.findIndex((t) => t.id === currentTier.id);
    const nextTier = tierIndex >= 0 && tierIndex < RAPPEL_TIERS.length - 1 ? RAPPEL_TIERS[tierIndex + 1] : null;
    const remainingToNextTier = nextTier ? Math.max(0, nextTier.minRevenue - annualRevenue) : 0;
    const pendingRebate = computeRebateAmount(annualRevenue, currentTier.rebatePct);
    const effectiveCommission =
      annualRevenue > 0
        ? round2(((commissionCharged - pendingRebate) / annualRevenue) * 100)
        : currentTier.commissionPct;

    return {
      vendorId: vo.vendorId,
      tradeName: vendor?.tradeName ?? "—",
      city: vendor?.city ?? null,
      annualRevenue: round2(annualRevenue),
      commissionCharged: round2(commissionCharged),
      currentTier,
      nextTier,
      remainingToNextTier: round2(remainingToNextTier),
      pendingRebate,
      effectiveCommission,
    };
  });
}

export type CloseYearResult = {
  year: number;
  created: number;
  skippedExisting: number;
  skippedZero: number;
};

/**
 * Congela liquidaciones PENDING para cada productor con rappel > 0.
 * No sobrescribe filas ya existentes (PENDING/PAID/CANCELLED).
 */
export async function closeRappelYear(
  year: number,
  closedByUserId?: string | null,
): Promise<CloseYearResult> {
  const snapshots = await getVendorRappelSnapshots(year);
  const existing = await prisma.rappelSettlement.findMany({
    where: { year },
    select: { vendorId: true },
  });
  const existingSet = new Set(existing.map((e) => e.vendorId));

  let created = 0;
  let skippedExisting = 0;
  let skippedZero = 0;
  const dueAt = rappelDueAt(year);

  const rows: Prisma.RappelSettlementCreateManyInput[] = [];

  for (const snap of snapshots) {
    if (existingSet.has(snap.vendorId)) {
      skippedExisting += 1;
      continue;
    }
    if (snap.pendingRebate <= 0) {
      skippedZero += 1;
      continue;
    }
    rows.push({
      vendorId: snap.vendorId,
      year,
      tierId: snap.currentTier.id,
      tierName: snap.currentTier.name,
      rebatePct: snap.currentTier.rebatePct,
      annualRevenue: snap.annualRevenue,
      commissionCharged: snap.commissionCharged,
      rebateAmount: snap.pendingRebate,
      status: "PENDING",
      dueAt,
      closedByUserId: closedByUserId ?? null,
    });
  }

  if (rows.length > 0) {
    const result = await prisma.rappelSettlement.createMany({ data: rows });
    created = result.count;
  }

  return { year, created, skippedExisting, skippedZero };
}
