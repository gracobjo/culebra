import { AuditAction, CommissionRuleType, ContractStatus, DEFAULT_MARKETPLACE_COMMISSION_PERCENT, DEFAULT_MIN_COMMISSION_EUR } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { CommissionRuleCreateInput } from "./commission.schemas.js";
import { getCategoryById } from "./category.service.js";
import { getVendorById, getVendorByUserId } from "./vendor.service.js";

export type CommissionRuleRecord = {
  id: string;
  vendorId: string;
  versionNumber: number;
  ruleType: CommissionRuleType;
  percentage: string | null;
  fixedAmount: string | null;
  categoryId: string | null;
  categoryName: string | null;
  validFrom: Date;
  validTo: Date | null;
  notes: string | null;
  createdAt: Date;
  isActive: boolean;
};

export type LineCommission = {
  rate: number;
  amount: number;
  net: number;
  source: "CATEGORY" | "PERCENTAGE" | "CONTRACT" | "DEFAULT";
  ruleId: string | null;
};

export { DEFAULT_MARKETPLACE_COMMISSION_PERCENT, DEFAULT_MIN_COMMISSION_EUR };

export type EffectiveCommission = {
  percent: number;
  source: LineCommission["source"];
  ruleId: string | null;
};

export type VendorCommissionBreakdown = {
  lineCommissionTotal: number;
  fixedFee: number;
  marketplaceCommission: number;
  vendorNetAmount: number;
};

type RuleRow = {
  id: string;
  vendorId: string;
  versionNumber: number;
  ruleType: string;
  percentage: { toString(): string } | null;
  fixedAmount: { toString(): string } | null;
  categoryId: string | null;
  validFrom: Date;
  validTo: Date | null;
  notes: string | null;
  createdAt: Date;
  category?: { name: string } | null;
};

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function isRuleActive(rule: { validFrom: Date; validTo: Date | null }, at: Date): boolean {
  return rule.validFrom <= at && (!rule.validTo || rule.validTo > at);
}

function mapRule(rule: RuleRow, at = new Date()): CommissionRuleRecord {
  return {
    id: rule.id,
    vendorId: rule.vendorId,
    versionNumber: rule.versionNumber,
    ruleType: rule.ruleType as CommissionRuleType,
    percentage: rule.percentage?.toString() ?? null,
    fixedAmount: rule.fixedAmount?.toString() ?? null,
    categoryId: rule.categoryId,
    categoryName: rule.category?.name ?? null,
    validFrom: rule.validFrom,
    validTo: rule.validTo,
    notes: rule.notes,
    createdAt: rule.createdAt,
    isActive: isRuleActive(rule, at),
  };
}

async function writeAuditLog(params: {
  actorUserId?: string;
  actorIp?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actorIp: params.actorIp,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      metadata: params.metadata ?? undefined,
    },
  });
}

function applyPercent(gross: number, percent: number): { rate: number; amount: number; net: number } {
  const amount = roundMoney((gross * percent) / 100);
  return {
    rate: percent,
    amount,
    net: roundMoney(Math.max(0, gross - amount)),
  };
}

async function getActiveContractPercent(vendorId: string): Promise<number | null> {
  const version = await prisma.vendorContractVersion.findFirst({
    where: {
      status: ContractStatus.ACTIVE,
      contract: { vendorId },
      commissionPercent: { not: null },
    },
    orderBy: { versionNumber: "desc" },
  });
  if (!version?.commissionPercent) {
    return null;
  }
  return Number(version.commissionPercent);
}

export async function listCommissionRulesForVendor(
  vendorId: string,
): Promise<CommissionRuleRecord[]> {
  const rules = await prisma.commissionRule.findMany({
    where: { vendorId },
    include: { category: { select: { name: true } } },
    orderBy: { versionNumber: "desc" },
  });
  return rules.map((rule: (typeof rules)[number]) =>
    mapRule(rule as Parameters<typeof mapRule>[0]),
  );
}

export async function listCommissionRulesForUser(
  userId: string,
): Promise<CommissionRuleRecord[]> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }
  return listCommissionRulesForVendor(vendor.id);
}

export async function getActiveCommissionRules(
  vendorId: string,
  at = new Date(),
): Promise<CommissionRuleRecord[]> {
  const rules = await prisma.commissionRule.findMany({
    where: {
      vendorId,
      validFrom: { lte: at },
      OR: [{ validTo: null }, { validTo: { gt: at } }],
    },
    include: { category: { select: { name: true } } },
    orderBy: { versionNumber: "desc" },
  });
  return rules.map((rule: (typeof rules)[number]) =>
    mapRule(rule as Parameters<typeof mapRule>[0], at),
  );
}

export async function resolveLineCommission(params: {
  vendorId: string;
  categoryId: string | null;
  subcategoryId: string | null;
  gross: number;
  at?: Date;
  rules?: CommissionRuleRecord[];
  contractPercent?: number | null;
}): Promise<LineCommission> {
  const at = params.at ?? new Date();
  const rules = params.rules ?? (await getActiveCommissionRules(params.vendorId, at));
  const categoryIds = [params.subcategoryId, params.categoryId].filter(
    (id): id is string => Boolean(id),
  );

  const categoryRule = rules.find(
    (rule) =>
      rule.ruleType === CommissionRuleType.CATEGORY &&
      rule.categoryId &&
      categoryIds.includes(rule.categoryId) &&
      rule.percentage != null,
  );
  if (categoryRule?.percentage != null) {
    const applied = applyPercent(params.gross, Number(categoryRule.percentage));
    return { ...applied, source: "CATEGORY", ruleId: categoryRule.id };
  }

  const percentRule = rules.find(
    (rule) => rule.ruleType === CommissionRuleType.PERCENTAGE && rule.percentage != null,
  );
  if (percentRule?.percentage != null) {
    const applied = applyPercent(params.gross, Number(percentRule.percentage));
    return { ...applied, source: "PERCENTAGE", ruleId: percentRule.id };
  }

  const contractPercent =
    params.contractPercent === undefined
      ? await getActiveContractPercent(params.vendorId)
      : params.contractPercent;
  if (contractPercent != null && Number.isFinite(contractPercent)) {
    const applied = applyPercent(params.gross, contractPercent);
    return { ...applied, source: "CONTRACT", ruleId: null };
  }

  const applied = applyPercent(params.gross, DEFAULT_MARKETPLACE_COMMISSION_PERCENT);
  return { ...applied, source: "DEFAULT", ruleId: null };
}

export function resolveVendorFixedFee(
  rules: CommissionRuleRecord[],
): number {
  const fixed = rules.find((rule) => rule.ruleType === CommissionRuleType.FIXED);
  if (!fixed?.fixedAmount) {
    return 0;
  }
  return roundMoney(Number(fixed.fixedAmount));
}

export function finalizeVendorCommission(params: {
  vendorGross: number;
  lineCommissionTotal: number;
  fixedFee: number;
}): VendorCommissionBreakdown {
  const uncapped = roundMoney(params.lineCommissionTotal + params.fixedFee);
  // Suelo 4 € por subpedido de productor (sin superar el bruto).
  const withFloor = roundMoney(Math.max(uncapped, DEFAULT_MIN_COMMISSION_EUR));
  const marketplaceCommission = roundMoney(Math.min(params.vendorGross, withFloor));
  return {
    lineCommissionTotal: roundMoney(params.lineCommissionTotal),
    fixedFee: roundMoney(params.fixedFee),
    marketplaceCommission,
    vendorNetAmount: roundMoney(params.vendorGross - marketplaceCommission),
  };
}

export async function createCommissionRuleForAdmin(
  adminUserId: string,
  vendorId: string,
  input: CommissionRuleCreateInput,
  context?: { ipAddress?: string },
): Promise<CommissionRuleRecord> {
  const vendor = await getVendorById(vendorId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  if (input.ruleType === CommissionRuleType.CATEGORY && input.categoryId) {
    const category = await getCategoryById(input.categoryId);
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  const now = new Date();
  const latest = await prisma.commissionRule.findFirst({
    where: { vendorId },
    orderBy: { versionNumber: "desc" },
  });

  const overlapWhere = {
    vendorId,
    ruleType: input.ruleType,
    validTo: null,
    ...(input.ruleType === CommissionRuleType.CATEGORY
      ? { categoryId: input.categoryId ?? null }
      : { categoryId: null }),
  };

  const created = await prisma.$transaction(async (tx: typeof prisma) => {
    await tx.commissionRule.updateMany({
      where: overlapWhere,
      data: { validTo: now },
    });

    return tx.commissionRule.create({
      data: {
        vendorId,
        versionNumber: (latest?.versionNumber ?? 0) + 1,
        ruleType: input.ruleType,
        percentage:
          input.ruleType === CommissionRuleType.FIXED ? null : (input.percentage ?? null),
        fixedAmount:
          input.ruleType === CommissionRuleType.FIXED ? (input.fixedAmount ?? null) : null,
        categoryId:
          input.ruleType === CommissionRuleType.CATEGORY ? (input.categoryId ?? null) : null,
        validFrom: now,
        notes: input.notes ?? null,
      },
      include: { category: { select: { name: true } } },
    });
  });

  await writeAuditLog({
    actorUserId: adminUserId,
    actorIp: context?.ipAddress,
    entityType: "CommissionRule",
    entityId: created.id,
    action: AuditAction.CREATE,
    metadata: {
      vendorId,
      ruleType: input.ruleType,
      versionNumber: created.versionNumber,
      percentage: input.percentage,
      fixedAmount: input.fixedAmount,
      categoryId: input.categoryId,
    },
  });

  return mapRule(created as Parameters<typeof mapRule>[0]);
}

export async function syncCommissionRuleFromContract(params: {
  vendorId: string;
  actorUserId: string;
  commissionPercent: number;
  actorIp?: string;
}): Promise<CommissionRuleRecord | null> {
  const active = await getActiveCommissionRules(params.vendorId);
  const percentRule = active.find(
    (rule) => rule.ruleType === CommissionRuleType.PERCENTAGE,
  );
  if (percentRule && Number(percentRule.percentage) === params.commissionPercent) {
    return percentRule;
  }

  return createCommissionRuleForAdmin(params.actorUserId, params.vendorId, {
    ruleType: CommissionRuleType.PERCENTAGE,
    percentage: params.commissionPercent,
    notes: "Sincronizada desde contrato activo",
  }, { ipAddress: params.actorIp });
}

export async function loadCommissionContext(vendorIds: string[], at = new Date()) {
  const [rules, contracts] = await Promise.all([
    prisma.commissionRule.findMany({
      where: {
        vendorId: { in: vendorIds },
        validFrom: { lte: at },
        OR: [{ validTo: null }, { validTo: { gt: at } }],
      },
      include: { category: { select: { name: true } } },
      orderBy: { versionNumber: "desc" },
    }),
    prisma.vendorContractVersion.findMany({
      where: {
        status: ContractStatus.ACTIVE,
        contract: { vendorId: { in: vendorIds } },
        commissionPercent: { not: null },
      },
      include: { contract: { select: { vendorId: true } } },
    }),
  ]);

  const rulesByVendor = new Map<string, CommissionRuleRecord[]>();
  for (const vendorId of vendorIds) {
    rulesByVendor.set(vendorId, []);
  }
  for (const rule of rules as RuleRow[]) {
    const mapped = mapRule(rule, at);
    const list = rulesByVendor.get(mapped.vendorId) ?? [];
    list.push(mapped);
    rulesByVendor.set(mapped.vendorId, list);
  }

  const contractPercentByVendor = new Map<string, number>();
  for (const version of contracts as Array<{
    commissionPercent: { toString(): string } | null;
    contract: { vendorId: string };
  }>) {
    if (!version.commissionPercent) {
      continue;
    }
    contractPercentByVendor.set(
      version.contract.vendorId,
      Number(version.commissionPercent),
    );
  }

  return { rulesByVendor, contractPercentByVendor };
}

export async function getEffectiveCommissionPercent(
  vendorId: string,
  at = new Date(),
): Promise<EffectiveCommission> {
  const rules = await getActiveCommissionRules(vendorId, at);

  const categoryRule = rules.find(
    (rule) => rule.ruleType === CommissionRuleType.CATEGORY && rule.percentage != null,
  );
  if (categoryRule?.percentage != null) {
    return {
      percent: Number(categoryRule.percentage),
      source: "CATEGORY",
      ruleId: categoryRule.id,
    };
  }

  const percentRule = rules.find(
    (rule) => rule.ruleType === CommissionRuleType.PERCENTAGE && rule.percentage != null,
  );
  if (percentRule?.percentage != null) {
    return {
      percent: Number(percentRule.percentage),
      source: "PERCENTAGE",
      ruleId: percentRule.id,
    };
  }

  const contractPercent = await getActiveContractPercent(vendorId);
  if (contractPercent != null && Number.isFinite(contractPercent)) {
    return { percent: contractPercent, source: "CONTRACT", ruleId: null };
  }

  return {
    percent: DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
    source: "DEFAULT",
    ruleId: null,
  };
}

/** Crea regla PERCENTAGE al porcentaje por defecto si el productor no tiene ninguna activa. */
export async function ensureDefaultCommissionRuleForVendor(
  vendorId: string,
  actorUserId: string,
): Promise<CommissionRuleRecord | null> {
  const active = await getActiveCommissionRules(vendorId);
  const hasPercentRule = active.some(
    (rule) => rule.ruleType === CommissionRuleType.PERCENTAGE,
  );
  if (hasPercentRule) {
    return null;
  }

  return createCommissionRuleForAdmin(actorUserId, vendorId, {
    ruleType: CommissionRuleType.PERCENTAGE,
    percentage: DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
    notes: "Comision por defecto de la plataforma",
  });
}

export async function setVendorCommissionPercentForAdmin(
  adminUserId: string,
  vendorId: string,
  percentage: number,
  context?: { ipAddress?: string; notes?: string },
): Promise<CommissionRuleRecord> {
  return createCommissionRuleForAdmin(
    adminUserId,
    vendorId,
    {
      ruleType: CommissionRuleType.PERCENTAGE,
      percentage,
      notes: context?.notes ?? "Actualizacion de comision por administracion",
    },
    { ipAddress: context?.ipAddress },
  );
}
