import {
  ContractStatus,
  PayoutStatus,
  ProductStatus,
  UserRole,
  VendorStatus,
  type UserStatus,
} from "@culebra/domain";
import { prisma } from "@culebra/db";

export type AdminDashboardStats = {
  vendorsPending: number;
  productsPending: number;
  contractsPending: number;
  payoutsPending: number;
  ordersTotal: number;
  usersTotal: number;
};

export type AdminUserRecord = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
  roles: UserRole[];
  vendorTradeName: string | null;
  vendorStatus: string | null;
  createdAt: Date;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    vendorsPending,
    productsPending,
    contractsPending,
    payoutsPending,
    ordersTotal,
    usersTotal,
  ] = await Promise.all([
    prisma.vendor.count({
      where: { deletedAt: null, status: VendorStatus.PENDING_REVIEW },
    }),
    prisma.product.count({
      where: { deletedAt: null, status: ProductStatus.PENDING_REVIEW },
    }),
    prisma.vendorContract.count({
      where: { status: ContractStatus.PENDING_SIGNATURE },
    }),
    prisma.payout.count({
      where: { status: PayoutStatus.PENDING },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  return {
    vendorsPending,
    productsPending,
    contractsPending,
    payoutsPending,
    ordersTotal,
    usersTotal,
  };
}

export async function listUsersForAdmin(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ items: AdminUserRecord[]; total: number }> {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  const where = { deletedAt: null };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        roles: { include: { role: true } },
        vendor: { select: { tradeName: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: AdminUserRecord[] = rows.map((user: (typeof rows)[number]) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status as UserStatus,
    roles: user.roles.map(
      (assignment: { role: { name: string } }) => assignment.role.name as UserRole,
    ),
    vendorTradeName: user.vendor?.tradeName ?? null,
    vendorStatus: user.vendor?.status ?? null,
    createdAt: user.createdAt,
  }));

  return { items, total };
}

export async function updateUserStatusByAdmin(
  userId: string,
  adminUserId: string,
  status: UserStatus,
): Promise<AdminUserRecord> {
  if (userId === adminUserId) {
    throw new Error("ADMIN_CANNOT_SELF_SUSPEND");
  }

  const existing = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("USER_NOT_FOUND");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUserId,
      entityType: "User",
      entityId: userId,
      action: "STATUS_CHANGE",
      oldValue: existing.status,
      newValue: status,
    },
  });

  const updated = (await prisma.user.findFirst({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      vendor: { select: { tradeName: true, status: true } },
    },
  })) as {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdAt: Date;
    roles: Array<{ role: { name: string } }>;
    vendor: { tradeName: string; status: string } | null;
  } | null;

  if (!updated) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    status: updated.status as UserStatus,
    roles: updated.roles.map((assignment) => assignment.role.name as UserRole),
    vendorTradeName: updated.vendor?.tradeName ?? null,
    vendorStatus: updated.vendor?.status ?? null,
    createdAt: updated.createdAt,
  };
}
