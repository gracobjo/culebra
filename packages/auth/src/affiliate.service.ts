import { prisma } from "@culebra/db";

import type { AffiliateUpsertInput } from "./affiliate.schemas.js";

export type AffiliateCodeRecord = {
  id: string;
  code: string;
  label: string;
  accommodationId: string | null;
  accommodationName: string | null;
  isActive: boolean;
  clickCount: number;
  orderCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function emptyToNull(value?: string | null) {
  if (value == null || value === "") return null;
  return value;
}

function mapAffiliate(row: {
  id: string;
  code: string;
  label: string;
  accommodationId: string | null;
  isActive: boolean;
  clickCount: number;
  orderCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  accommodation?: { name: string } | null;
}): AffiliateCodeRecord {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    accommodationId: row.accommodationId,
    accommodationName: row.accommodation?.name ?? null,
    isActive: row.isActive,
    clickCount: row.clickCount,
    orderCount: row.orderCount,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getActiveAffiliateByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const row = await prisma.affiliateCode.findUnique({
    where: { code: normalized },
    include: { accommodation: { select: { name: true } } },
  });
  if (!row || !row.isActive) return null;
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
    include: { accommodation: { select: { name: true } } },
  });
  return rows.map(mapAffiliate);
}

export async function upsertAffiliateCodeForAdmin(
  input: AffiliateUpsertInput,
  id?: string,
): Promise<AffiliateCodeRecord> {
  const data = {
    code: input.code,
    label: input.label,
    accommodationId: emptyToNull(input.accommodationId),
    isActive: input.isActive,
    notes: emptyToNull(input.notes),
  };

  const row = id
    ? await prisma.affiliateCode.update({
        where: { id },
        data,
        include: { accommodation: { select: { name: true } } },
      })
    : await prisma.affiliateCode.create({
        data,
        include: { accommodation: { select: { name: true } } },
      });

  return mapAffiliate(row);
}
