import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEffectiveCommissionPercent,
  getVendorById,
  listCommissionRulesForVendor,
  listContractsForAdmin,
  DEFAULT_MARKETPLACE_COMMISSION_PERCENT,
} from "@culebra/auth";
import type { CommissionRuleRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  CommissionRuleForm,
  ContractVersionForm,
  VendorStatusForm,
} from "@/components/admin/admin-forms";
import { updateVendorStatusAction } from "@/app/admin/actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminVendorDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor) {
    notFound();
  }

  const [contracts, rules, effectiveCommission] = await Promise.all([
    listContractsForAdmin({ vendorId: id }),
    listCommissionRulesForVendor(id),
    getEffectiveCommissionPercent(id),
  ]);
  const contract = contracts.items[0];
  const activeRules = rules.filter((rule: CommissionRuleRecord) => rule.isActive);

  return (
    <AdminShell title={vendor.tradeName}>
      <p className="text-sm text-stone-600">
        Estado: {vendor.status} · /{vendor.slug} · {vendor.city ?? "sin municipio"} · Comision
        efectiva: {effectiveCommission.percent}%
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <VendorStatusForm
          vendorId={vendor.id}
          action={updateVendorStatusAction}
          status="ACTIVE"
          label="Aprobar"
        />
        <VendorStatusForm
          vendorId={vendor.id}
          action={updateVendorStatusAction}
          status="REJECTED"
          label="Rechazar"
        />
        <VendorStatusForm
          vendorId={vendor.id}
          action={updateVendorStatusAction}
          status="SUSPENDED"
          label="Suspender"
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Nuevo contrato</h2>
          {contract ? (
            <p className="mt-2 text-sm text-stone-600">
              Contrato {contract.status}
              {contract.latestVersionNumber ? ` · v${contract.latestVersionNumber}` : ""}
              {" · "}
              <Link href={`/admin/contratos/${contract.id}`} className="text-emerald-800 underline">
                Ver
              </Link>
            </p>
          ) : null}
          <div className="mt-4">
            <ContractVersionForm vendorId={vendor.id} />
          </div>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium">Comision</h2>
          <p className="mt-2 text-sm text-stone-600">
            Por defecto la plataforma aplica {DEFAULT_MARKETPLACE_COMMISSION_PERCENT}%. Puedes
            subir o bajar el porcentaje creando una nueva version (solo afecta a pedidos futuros).
          </p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {activeRules.map((rule: CommissionRuleRecord) => (
              <li key={rule.id}>
                {rule.ruleType} · {rule.percentage ? `${rule.percentage}%` : ""}
                {rule.fixedAmount ? `${rule.fixedAmount} EUR` : ""} · v{rule.versionNumber}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <CommissionRuleForm vendorId={vendor.id} />
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
