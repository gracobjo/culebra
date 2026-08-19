import { listAuditLogsForAdmin } from "@culebra/auth";
import type { AdminAuditLogRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Auditoria | Admin" };

export default async function AdminAuditPage() {
  await requireAdmin("/admin/auditoria");
  const logs = await listAuditLogsForAdmin({ limit: 100 });

  return (
    <AdminShell title="Auditoria">
      <p className="text-sm text-stone-500">
        Ultimos eventos registrados en el sistema (max. 100).
      </p>
      <ul className="mt-4 space-y-3">
        {logs.items.map((log: AdminAuditLogRecord) => (
          <li key={log.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {log.action} · {log.entityType} · {log.entityId}
                </p>
                <p className="text-sm text-stone-500">
                  {log.actorEmail ?? "Sistema"}
                  {log.actorIp ? ` · ${log.actorIp}` : ""} · {formatDate(log.createdAt)}
                </p>
                {(log.oldValue || log.newValue) && (
                  <p className="mt-1 text-sm text-stone-600">
                    {log.oldValue ? `${log.oldValue} → ` : ""}
                    {log.newValue ?? ""}
                  </p>
                )}
                {log.fieldName && (
                  <p className="mt-1 text-xs text-stone-500">Campo: {log.fieldName}</p>
                )}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-stone-50 p-3 text-xs text-stone-700">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </li>
        ))}
        {logs.items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
            No hay registros de auditoria todavia.
          </li>
        )}
      </ul>
    </AdminShell>
  );
}
