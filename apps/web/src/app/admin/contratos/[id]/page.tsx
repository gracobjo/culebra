import { notFound } from "next/navigation";
import { getContractById } from "@culebra/auth";
import type { ContractVersionRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { publishContractAction } from "@/app/admin/actions";
import { formatDate } from "@/lib/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminContractDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) {
    notFound();
  }

  return (
    <AdminShell title="Contrato">
      <p className="text-sm text-stone-600">Estado: {contract.status}</p>
      <ul className="mt-6 space-y-4">
        {contract.versions.map((version: ContractVersionRecord) => (
          <li key={version.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">Version {version.versionNumber}</p>
              <span className="text-sm">{version.status}</span>
            </div>
            {version.commissionPercent ? (
              <p className="mt-1 text-sm text-stone-600">Comision {version.commissionPercent}%</p>
            ) : null}
            <p className="mt-1 text-xs text-stone-500">{formatDate(version.createdAt)}</p>
            {version.status === "DRAFT" ? (
              <form action={publishContractAction.bind(null, contract.id, version.id)} className="mt-3">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-4 py-2 text-sm text-white"
                >
                  Enviar a firma
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
