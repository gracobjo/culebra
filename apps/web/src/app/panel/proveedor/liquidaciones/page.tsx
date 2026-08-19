import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listCommissionRulesForUser, listPayoutsForVendor } from "@culebra/auth";
import type { CommissionRuleRecord, PayoutRecord } from "@culebra/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { RetryPayoutsButton } from "@/components/vendor/retry-payouts-button";

export const metadata = {
  title: "Liquidaciones | Panel productor",
};

const payoutStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  PAID: "Pagada",
  FAILED: "Fallida",
  CANCELLED: "Cancelada",
};

const ruleTypeLabels: Record<string, string> = {
  PERCENTAGE: "Porcentaje",
  FIXED: "Fija por pedido",
  CATEGORY: "Por categoria",
};

export default async function VendorSettlementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/liquidaciones");
  }

  let payouts;
  let rules;
  try {
    [payouts, rules] = await Promise.all([
      listPayoutsForVendor(session.user.id),
      listCommissionRulesForUser(session.user.id),
    ]);
  } catch {
    redirect("/quiero-vender");
  }

  const activeRules = rules.filter((rule: CommissionRuleRecord) => rule.isActive);

  return (
    <PageShell width="lg">
      <Link href="/panel/proveedor" className="text-sm text-emerald-800">
        ← Volver al perfil
      </Link>
      <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">Liquidaciones</h1>
      <p className="mt-3 text-stone-600">
        Comision de la plataforma y transferencias a tu cuenta Stripe. Los cambios de
        comision no se aplican a pedidos ya creados.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Neto pagado</p>
          <p className="mt-2 text-xl font-semibold">{formatPrice(payouts.totals.paidNet)}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Neto pendiente</p>
          <p className="mt-2 text-xl font-semibold">{formatPrice(payouts.totals.pendingNet)}</p>
        </div>
        <div className="rounded-3xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Comision acumulada</p>
          <p className="mt-2 text-xl font-semibold">{formatPrice(payouts.totals.commission)}</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Reglas de comision vigentes</h2>
        {activeRules.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">
            No hay una regla de comision activa. Si el contrato indica un porcentaje, se
            aplicara como respaldo. Si no, la comision es 0.
          </p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {activeRules.map((rule: CommissionRuleRecord) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 px-4 py-3"
              >
                <span>{ruleTypeLabels[rule.ruleType] ?? rule.ruleType}</span>
                <span>
                  {rule.percentage != null ? `${rule.percentage}%` : null}
                  {rule.fixedAmount != null ? formatPrice(rule.fixedAmount) : null}
                  {rule.categoryName ? ` · ${rule.categoryName}` : ""}
                </span>
                <span className="text-stone-500">v{rule.versionNumber}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Historial de liquidaciones</h2>
          <RetryPayoutsButton />
        </div>
        {payouts.items.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">Aun no hay liquidaciones.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {payouts.items.map((payout: PayoutRecord) => (
              <li
                key={payout.id}
                className="rounded-xl border border-stone-100 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/panel/proveedor/pedidos/${payout.vendorOrderId}`}
                    className="font-medium text-emerald-800"
                  >
                    {payout.orderNumber}
                  </Link>
                  <span>{payoutStatusLabels[payout.status] ?? payout.status}</span>
                </div>
                <p className="mt-2 text-stone-600">
                  Bruto {formatPrice(payout.amountGross)} · Comision{" "}
                  {formatPrice(payout.commissionMarketplace)} · Neto{" "}
                  {formatPrice(payout.amountNetToVendor)}
                </p>
                {payout.heldForWithdrawal && payout.releasesAt ? (
                  <p className="mt-1 text-xs text-amber-700">
                    Retenido por derecho de desistimiento · Disponible el{" "}
                    {formatDate(payout.releasesAt)}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-stone-500">{formatDate(payout.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
