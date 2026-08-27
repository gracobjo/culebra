import { createHash } from "node:crypto";

import { AuditAction, ContractStatus, DEFAULT_MARKETPLACE_COMMISSION_PERCENT } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { ContractVersionCreateInput } from "./contract.schemas.js";
import { syncCommissionRuleFromContract } from "./commission.service.js";
import { toInputJson } from "./prisma-helpers.js";
import { getVendorById, getVendorByUserId } from "./vendor.service.js";

export const DEFAULT_CONTRACT_CONDITIONS = `[REVISAR CON ABOGADO]

Contrato marco de colaboracion entre el productor y Sierra de la Culebra Marketplace.

El productor autoriza la venta de sus productos a traves de la plataforma, cumpliendo la normativa alimentaria aplicable y facilitando informacion veraz sobre origen, ingredientes y alergenos.

La plataforma gestionara cobros al cliente y liquidaciones al productor segun las reglas de comision vigentes en cada version del contrato.

Este texto es un placeholder hasta revision juridica profesional.`;

export type ContractAcceptanceRecord = {
  id: string;
  userId: string;
  ipAddress: string | null;
  documentHash: string | null;
  acceptedAt: Date;
};

export type ContractVersionRecord = {
  id: string;
  contractId: string;
  versionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  status: ContractStatus;
  documentUrl: string | null;
  commissionPercent: string | null;
  conditions: string | null;
  observations: string | null;
  createdAt: Date;
  acceptances: ContractAcceptanceRecord[];
};

export type ContractRecord = {
  id: string;
  vendorId: string;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
  versions: ContractVersionRecord[];
};

export type AdminContractListItem = {
  id: string;
  vendorId: string;
  vendorTradeName: string;
  status: ContractStatus;
  latestVersionNumber: number | null;
  pendingSignature: boolean;
  updatedAt: Date;
};

export type VendorContractStatus = {
  hasActiveContract: boolean;
  pendingVersion: ContractVersionRecord | null;
  activeVersion: ContractVersionRecord | null;
  contract: ContractRecord | null;
};

type ContractVersionRow = {
  id: string;
  contractId: string;
  versionNumber: number;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  documentUrl: string | null;
  commissionPercent: { toString(): string } | null;
  conditions: string | null;
  observations: string | null;
  createdAt: Date;
  acceptances?: Array<{
    id: string;
    userId: string;
    ipAddress: string | null;
    documentHash: string | null;
    acceptedAt: Date;
  }>;
};

function mapVersion(version: ContractVersionRow): ContractVersionRecord {
  return {
    id: version.id,
    contractId: version.contractId,
    versionNumber: version.versionNumber,
    startDate: version.startDate,
    endDate: version.endDate,
    status: version.status as ContractStatus,
    documentUrl: version.documentUrl,
    commissionPercent: version.commissionPercent?.toString() ?? null,
    conditions: version.conditions,
    observations: version.observations,
    createdAt: version.createdAt,
    acceptances: (version.acceptances ?? []).map((acceptance) => ({
      id: acceptance.id,
      userId: acceptance.userId,
      ipAddress: acceptance.ipAddress,
      documentHash: acceptance.documentHash,
      acceptedAt: acceptance.acceptedAt,
    })),
  };
}

function mapContract(contract: {
  id: string;
  vendorId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  versions?: ContractVersionRow[];
}): ContractRecord {
  return {
    id: contract.id,
    vendorId: contract.vendorId,
    status: contract.status as ContractStatus,
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
    versions: (contract.versions ?? [])
      .map(mapVersion)
      .sort((a, b) => b.versionNumber - a.versionNumber),
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
      metadata: toInputJson(params.metadata),
    },
  });
}

function computeDocumentHash(version: {
  contractId: string;
  versionNumber: number;
  conditions: string | null;
  commissionPercent: string | null;
}): string {
  const payload = JSON.stringify({
    contractId: version.contractId,
    versionNumber: version.versionNumber,
    conditions: version.conditions ?? "",
    commissionPercent: version.commissionPercent ?? "",
  });
  return createHash("sha256").update(payload).digest("hex");
}

async function getOrCreateVendorContract(vendorId: string) {
  const existing = await prisma.vendorContract.findFirst({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.vendorContract.create({
    data: {
      vendorId,
      status: ContractStatus.DRAFT,
    },
  });
}

export async function vendorHasActiveContract(vendorId: string): Promise<boolean> {
  const activeVersion = await prisma.vendorContractVersion.findFirst({
    where: {
      status: ContractStatus.ACTIVE,
      contract: { vendorId },
    },
  });
  return Boolean(activeVersion);
}

export async function listContractsForAdmin(params?: {
  vendorId?: string;
  status?: ContractStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;

  const where = {
    ...(params?.vendorId ? { vendorId: params.vendorId } : {}),
    ...(params?.status ? { status: params.status } : {}),
  };

  const [contracts, total] = await Promise.all([
    prisma.vendorContract.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        vendor: { select: { tradeName: true } },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    }),
    prisma.vendorContract.count({ where }),
  ]);

  const items: AdminContractListItem[] = contracts.map(
    (contract: (typeof contracts)[number]) => {
      const latest = contract.versions[0];
      return {
        id: contract.id,
        vendorId: contract.vendorId,
        vendorTradeName: contract.vendor.tradeName,
        status: contract.status as ContractStatus,
        latestVersionNumber: latest?.versionNumber ?? null,
        pendingSignature: contract.status === ContractStatus.PENDING_SIGNATURE,
        updatedAt: contract.updatedAt,
      };
    },
  );

  return { items, total };
}

export async function getContractById(contractId: string): Promise<ContractRecord | null> {
  const contract = await prisma.vendorContract.findUnique({
    where: { id: contractId },
    include: {
      versions: {
        include: { acceptances: true },
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!contract) {
    return null;
  }

  return mapContract(contract as Parameters<typeof mapContract>[0]);
}

export async function createContractVersionForAdmin(
  adminUserId: string,
  vendorId: string,
  input: ContractVersionCreateInput,
  context?: { ipAddress?: string },
): Promise<ContractRecord> {
  const vendor = await getVendorById(vendorId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const contract = await getOrCreateVendorContract(vendorId);

  const pendingVersion = await prisma.vendorContractVersion.findFirst({
    where: {
      contractId: contract.id,
      status: ContractStatus.PENDING_SIGNATURE,
    },
  });
  if (pendingVersion) {
    throw new Error("CONTRACT_PENDING_EXISTS");
  }

  const latest = await prisma.vendorContractVersion.findFirst({
    where: { contractId: contract.id },
    orderBy: { versionNumber: "desc" },
  });

  const version = await prisma.vendorContractVersion.create({
    data: {
      contractId: contract.id,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      status: ContractStatus.DRAFT,
      conditions: input.conditions ?? DEFAULT_CONTRACT_CONDITIONS,
      commissionPercent: input.commissionPercent ?? DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      observations: input.observations ?? null,
      documentUrl: input.documentUrl ?? null,
    },
  });

  await writeAuditLog({
    actorUserId: adminUserId,
    actorIp: context?.ipAddress,
    entityType: "VendorContractVersion",
    entityId: version.id,
    action: AuditAction.CREATE,
    metadata: {
      vendorId,
      contractId: contract.id,
      versionNumber: version.versionNumber,
    },
  });

  const full = await getContractById(contract.id);
  if (!full) {
    throw new Error("CONTRACT_NOT_FOUND");
  }
  return full;
}

export async function publishContractVersionForAdmin(
  adminUserId: string,
  contractId: string,
  versionId: string,
  context?: { ipAddress?: string },
): Promise<ContractRecord> {
  const version = await prisma.vendorContractVersion.findFirst({
    where: { id: versionId, contractId },
  });

  if (!version) {
    throw new Error("CONTRACT_VERSION_NOT_FOUND");
  }

  if (version.status !== ContractStatus.DRAFT) {
    throw new Error("CONTRACT_INVALID_STATUS");
  }

  const otherPending = await prisma.vendorContractVersion.findFirst({
    where: {
      contractId,
      status: ContractStatus.PENDING_SIGNATURE,
      id: { not: versionId },
    },
  });
  if (otherPending) {
    throw new Error("CONTRACT_PENDING_EXISTS");
  }

  await prisma.$transaction([
    prisma.vendorContractVersion.update({
      where: { id: versionId },
      data: { status: ContractStatus.PENDING_SIGNATURE },
    }),
    prisma.vendorContract.update({
      where: { id: contractId },
      data: { status: ContractStatus.PENDING_SIGNATURE },
    }),
  ]);

  await writeAuditLog({
    actorUserId: adminUserId,
    actorIp: context?.ipAddress,
    entityType: "VendorContractVersion",
    entityId: versionId,
    action: AuditAction.STATUS_CHANGE,
    metadata: {
      contractId,
      from: ContractStatus.DRAFT,
      to: ContractStatus.PENDING_SIGNATURE,
      versionNumber: version.versionNumber,
    },
  });

  const full = await getContractById(contractId);
  if (!full) {
    throw new Error("CONTRACT_NOT_FOUND");
  }
  return full;
}

export async function getVendorContractStatus(
  userId: string,
): Promise<VendorContractStatus> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const contract = await prisma.vendorContract.findFirst({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    include: {
      versions: {
        include: { acceptances: true },
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  if (!contract) {
    return {
      hasActiveContract: false,
      pendingVersion: null,
      activeVersion: null,
      contract: null,
    };
  }

  const mapped = mapContract(contract as Parameters<typeof mapContract>[0]);
  const pendingVersion =
    mapped.versions.find((v) => v.status === ContractStatus.PENDING_SIGNATURE) ??
    null;
  const activeVersion =
    mapped.versions.find((v) => v.status === ContractStatus.ACTIVE) ?? null;

  return {
    hasActiveContract: Boolean(activeVersion),
    pendingVersion,
    activeVersion,
    contract: mapped,
  };
}

export async function acceptContractVersion(
  userId: string,
  versionId: string,
  context?: { ipAddress?: string },
): Promise<ContractRecord> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const version = await prisma.vendorContractVersion.findUnique({
    where: { id: versionId },
    include: {
      contract: true,
      acceptances: true,
    },
  });

  if (!version || version.contract.vendorId !== vendor.id) {
    throw new Error("CONTRACT_FORBIDDEN");
  }

  if (version.status !== ContractStatus.PENDING_SIGNATURE) {
    throw new Error("CONTRACT_INVALID_STATUS");
  }

  const alreadyAccepted = version.acceptances.some(
    (acceptance: (typeof version.acceptances)[number]) =>
      acceptance.userId === userId,
  );
  if (alreadyAccepted) {
    throw new Error("CONTRACT_ALREADY_ACCEPTED");
  }

  const documentHash = computeDocumentHash({
    contractId: version.contractId,
    versionNumber: version.versionNumber,
    conditions: version.conditions,
    commissionPercent: version.commissionPercent?.toString() ?? null,
  });

  await prisma.$transaction(async (tx) => {
    await tx.contractAcceptance.create({
      data: {
        contractVersionId: versionId,
        userId,
        ipAddress: context?.ipAddress ?? null,
        documentHash,
      },
    });

    await tx.vendorContractVersion.updateMany({
      where: {
        contractId: version.contractId,
        status: ContractStatus.ACTIVE,
      },
      data: { status: ContractStatus.EXPIRED },
    });

    await tx.vendorContractVersion.update({
      where: { id: versionId },
      data: { status: ContractStatus.ACTIVE },
    });

    await tx.vendorContract.update({
      where: { id: version.contractId },
      data: { status: ContractStatus.ACTIVE },
    });
  });

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "VendorContractVersion",
    entityId: versionId,
    action: AuditAction.SIGN,
    metadata: {
      contractId: version.contractId,
      versionNumber: version.versionNumber,
      documentHash,
    },
  });

  const commissionPercent =
    version.commissionPercent != null
      ? Number(version.commissionPercent)
      : DEFAULT_MARKETPLACE_COMMISSION_PERCENT;

  await syncCommissionRuleFromContract({
    vendorId: vendor.id,
    actorUserId: userId,
    commissionPercent,
    actorIp: context?.ipAddress,
  });

  const full = await getContractById(version.contractId);
  if (!full) {
    throw new Error("CONTRACT_NOT_FOUND");
  }
  return full;
}
