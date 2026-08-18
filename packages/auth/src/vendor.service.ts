import { AuditAction, UserRole, VendorStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import { createUniqueSlug } from "./slug.js";
import type {
  VendorApplyInput,
  VendorStatusUpdateInput,
  VendorUpdateInput,
} from "./vendor.schemas.js";

export type VendorRecord = {
  id: string;
  userId: string;
  tradeName: string;
  legalName: string | null;
  taxId: string | null;
  slug: string;
  description: string | null;
  history: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  logoUrl: string | null;
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicVendorRecord = Omit<VendorRecord, "taxId" | "userId"> & {
  productCount?: number;
};

function mapVendor(vendor: {
  id: string;
  userId: string;
  tradeName: string;
  legalName: string | null;
  taxId: string | null;
  slug: string;
  description: string | null;
  history: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  socialLinks: unknown;
  logoUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): VendorRecord {
  return {
    ...vendor,
    socialLinks: (vendor.socialLinks as Record<string, string> | null) ?? null,
    status: vendor.status as VendorStatus,
  };
}

function toPublicVendor(vendor: VendorRecord, productCount = 0): PublicVendorRecord {
  const { taxId: _taxId, userId: _userId, ...publicVendor } = vendor;
  return { ...publicVendor, productCount };
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
      metadata: params.metadata,
    },
  });
}

async function ensureVendorRole(userId: string) {
  const vendorRole = await prisma.role.findUnique({
    where: { name: UserRole.VENDOR },
  });
  if (!vendorRole) {
    throw new Error("VENDOR_ROLE_NOT_FOUND");
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: vendorRole.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: vendorRole.id,
    },
  });
}

export async function applyAsVendor(
  userId: string,
  input: VendorApplyInput,
  context?: { ipAddress?: string },
): Promise<VendorRecord> {
  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) {
    throw new Error("VENDOR_ALREADY_EXISTS");
  }

  const slug = await createUniqueSlug(input.tradeName, async (candidate) => {
    const found = await prisma.vendor.findUnique({ where: { slug: candidate } });
    return Boolean(found);
  });

  const vendor = (await prisma.vendor.create({
    data: {
      userId,
      tradeName: input.tradeName,
      legalName: input.legalName,
      taxId: input.taxId,
      slug,
      description: input.description,
      history: input.history,
      street: input.street,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      country: input.country ?? "ES",
      phone: input.phone,
      email: input.email,
      website: input.website || null,
      socialLinks: input.socialLinks ?? undefined,
      logoUrl: input.logoUrl,
      status: VendorStatus.DRAFT,
    },
  })) as Parameters<typeof mapVendor>[0];

  await ensureVendorRole(userId);

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Vendor",
    entityId: vendor.id,
    action: AuditAction.CREATE,
    metadata: { tradeName: vendor.tradeName, slug: vendor.slug },
  });

  return mapVendor(vendor);
}

export async function getVendorByUserId(userId: string): Promise<VendorRecord | null> {
  const vendor = await prisma.vendor.findFirst({
    where: { userId, deletedAt: null },
  });
  return vendor ? mapVendor(vendor as Parameters<typeof mapVendor>[0]) : null;
}

export async function getVendorById(vendorId: string): Promise<VendorRecord | null> {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, deletedAt: null },
  });
  return vendor ? mapVendor(vendor as Parameters<typeof mapVendor>[0]) : null;
}

export async function updateVendorProfile(
  userId: string,
  input: VendorUpdateInput,
  context?: { ipAddress?: string },
): Promise<VendorRecord> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const editableStatuses = [VendorStatus.DRAFT, VendorStatus.REJECTED] as const;
  if (!editableStatuses.includes(vendor.status as (typeof editableStatuses)[number])) {
    throw new Error("VENDOR_NOT_EDITABLE");
  }

  const updated = (await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      ...input,
      website: input.website === "" ? null : input.website,
    },
  })) as Parameters<typeof mapVendor>[0];

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Vendor",
    entityId: vendor.id,
    action: AuditAction.UPDATE,
  });

  return mapVendor(updated);
}

export async function submitVendorForReview(
  userId: string,
  context?: { ipAddress?: string },
): Promise<VendorRecord> {
  const vendor = await getVendorByUserId(userId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const submittableStatuses = [VendorStatus.DRAFT, VendorStatus.REJECTED] as const;
  if (!submittableStatuses.includes(vendor.status as (typeof submittableStatuses)[number])) {
    throw new Error("VENDOR_INVALID_STATUS");
  }

  if (!vendor.tradeName || !vendor.city || !vendor.province) {
    throw new Error("VENDOR_PROFILE_INCOMPLETE");
  }

  const updated = (await prisma.vendor.update({
    where: { id: vendor.id },
    data: { status: VendorStatus.PENDING_REVIEW },
  })) as Parameters<typeof mapVendor>[0];

  await writeAuditLog({
    actorUserId: userId,
    actorIp: context?.ipAddress,
    entityType: "Vendor",
    entityId: vendor.id,
    action: AuditAction.STATUS_CHANGE,
    metadata: { status: VendorStatus.PENDING_REVIEW },
  });

  return mapVendor(updated);
}

export async function getPublicVendorBySlug(
  slug: string,
): Promise<PublicVendorRecord | null> {
  const vendor = await prisma.vendor.findFirst({
    where: {
      slug,
      status: VendorStatus.ACTIVE,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          products: {
            where: { status: "PUBLISHED", deletedAt: null },
          },
        },
      },
    },
  });

  if (!vendor) {
    return null;
  }

  const mapped = mapVendor(vendor as Parameters<typeof mapVendor>[0]);
  return toPublicVendor(mapped, vendor._count.products);
}

export async function listPublicVendors(params?: {
  search?: string;
  province?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: PublicVendorRecord[]; total: number }> {
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const where = {
    status: VendorStatus.ACTIVE,
    deletedAt: null,
    ...(params?.province ? { province: params.province } : {}),
    ...(params?.search
      ? {
          OR: [
            { tradeName: { contains: params.search, mode: "insensitive" as const } },
            { city: { contains: params.search, mode: "insensitive" as const } },
            { description: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { tradeName: "asc" },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED", deletedAt: null },
            },
          },
        },
      },
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    items: vendors.map((vendor: (typeof vendors)[number]) =>
      toPublicVendor(
        mapVendor(vendor as Parameters<typeof mapVendor>[0]),
        vendor._count.products,
      ),
    ),
    total,
  };
}

export async function listVendorsForAdmin(params?: {
  status?: VendorStatus;
  limit?: number;
  offset?: number;
}) {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;

  const where = {
    deletedAt: null,
    ...(params?.status ? { status: params.status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    items: items.map((vendor: (typeof items)[number]) =>
      mapVendor(vendor as Parameters<typeof mapVendor>[0]),
    ),
    total,
  };
}

export async function updateVendorStatusByAdmin(
  vendorId: string,
  adminUserId: string,
  input: VendorStatusUpdateInput,
  context?: { ipAddress?: string },
): Promise<VendorRecord> {
  const vendor = await getVendorById(vendorId);
  if (!vendor) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  const updated = (await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: input.status },
  })) as Parameters<typeof mapVendor>[0];

  if (input.status === VendorStatus.ACTIVE) {
    await ensureVendorRole(vendor.userId);
  }

  await writeAuditLog({
    actorUserId: adminUserId,
    actorIp: context?.ipAddress,
    entityType: "Vendor",
    entityId: vendorId,
    action:
      input.status === VendorStatus.ACTIVE
        ? AuditAction.APPROVE
        : input.status === VendorStatus.REJECTED
          ? AuditAction.REJECT
          : AuditAction.STATUS_CHANGE,
    metadata: {
      status: input.status,
      reviewNotes: input.reviewNotes,
    },
  });

  return mapVendor(updated);
}

export function assertVendorOwnership(
  authUserId: string,
  vendor: VendorRecord,
): void {
  if (vendor.userId !== authUserId) {
    throw new Error("VENDOR_FORBIDDEN");
  }
}
