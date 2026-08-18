import Link from "next/link";
import { listContractsForAdmin } from "@culebra/auth";
import type { AdminContractListItem } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Contratos | Admin" };

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_SIGNATURE: "Pendiente de firma",
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
  EXPIRING_SOON: "Proximo a vencer",
};

export default async function AdminContractsPage() {
  await requireAdmin();
  const contracts = await listContractsForAdmin();

  return (
    <AdminShell title="Contratos">
      <ul className="space-y-3">
        {contracts.items.map((contract: AdminContractListItem) => (
          <li key={contract.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/contratos/${contract.id}`} className="font-medium text-emerald-800">
                {contract.vendorTradeName}
              </Link>
              <span className="text-sm">{statusLabels[contract.status] ?? contract.status}</span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              v{contract.latestVersionNumber ?? "—"} · {formatDate(contract.updatedAt)}
            </p>
          </li>
        ))}
      </ul>
      {contracts.items.length === 0 ? (
        <p className="text-sm text-stone-600">
          Aun no hay contratos. Crealos desde la ficha del productor.
        </p>
      ) : null}
    </AdminShell>
  );
}
