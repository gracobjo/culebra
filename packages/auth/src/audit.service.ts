import type { AuditAction } from "@culebra/domain";
import { prisma } from "@culebra/db";

export type AdminAuditLogRecord = {
  id: string;
  actorEmail: string | null;
  actorIp: string | null;
  entityType: string;
  entityId: string;
  action: AuditAction;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export async function listAuditLogsForAdmin(params?: {
  limit?: number;
  offset?: number;
  entityType?: string;
  action?: AuditAction;
}): Promise<{ items: AdminAuditLogRecord[]; total: number }> {
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;
  const where = {
    ...(params?.entityType ? { entityType: params.entityType } : {}),
    ...(params?.action ? { action: params.action } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        actor: { select: { email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const items: AdminAuditLogRecord[] = rows.map((row: (typeof rows)[number]) => ({
    id: row.id,
    actorEmail: row.actor?.email ?? null,
    actorIp: row.actorIp,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action as AuditAction,
    fieldName: row.fieldName,
    oldValue: row.oldValue,
    newValue: row.newValue,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt,
  }));

  return { items, total };
}
