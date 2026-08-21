import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEffectiveCommissionPercent, getVendorByUserId, listCommissionRulesForUser, listPayoutsForVendor } from "@culebra/auth";
import { DEFAULT_MARKETPLACE_COMMISSION_PERCENT } from "@culebra/domain";
import type { CommissionRuleRecord, PayoutRecord } from "@culebra/auth";
import { prisma } from "@culebra/db";
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
  let effectiveCommission;
  let rappelSettlements: Awaited<ReturnType<typeof prisma.rappelSettlement.findMany>> = [];
  try {
    const vendor = await getVendorByUserId(session.user.id);
    if (!vendor) {
      throw new Error("VENDOR_NOT_FOUND");
    }
    [payouts, rules, effectiveCommission, rappelSettlements] = await Promise.all([
      listPayoutsForVendor(session.user.id),
      listCommissionRulesForUser(session.user.id),
      getEffectiveCommissionPercent(vendor.id),
      prisma.rappelSettlement.findMany({
        where: { vendorId: vendor.id },
        orderBy: [{ year: "desc" }],
      }),
    ]);
  } catch {
    redirect("/quiero-vender");
  }

  const activeRules = rules.filter((rule: CommissionRuleRecord) => rule.isActive);
  const rappelStatusLabels: Record<string, string> = {
    PENDING: "Pendiente de abono",
    PAID: "Abonado",
    CANCELLED: "Cancelado",
  };

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
        <p className="mt-2 text-sm text-stone-600">
          Comision aplicada en pedidos nuevos:{" "}
          <strong>{effectiveCommission.percent}%</strong>
          {effectiveCommission.source === "DEFAULT"
            ? ` (por defecto de la plataforma, ${DEFAULT_MARKETPLACE_COMMISSION_PERCENT}%)`
            : null}
        </p>
        {activeRules.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">
            No hay una regla personalizada activa. Se aplica el{" "}
            {DEFAULT_MARKETPLACE_COMMISSION_PERCENT}% por defecto del marketplace, salvo que tu
            contrato indique otro porcentaje.
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

      {rappelSettlements.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Rappels por volumen</h2>
          <p className="mt-2 text-sm text-stone-600">
            Abono anual según tramo (Plata/Oro) tras el cierre del año natural.
          </p>
          <ul className="mt-4 space-y-3">
            {rappelSettlements.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    Año {r.year} · {r.tierName}
                  </span>
                  <span
                    className={
                      r.status === "PENDING"
                        ? "text-amber-800"
                        : r.status === "PAID"
                          ? "text-emerald-800"
                          : "text-stone-500"
                    }
                  >
                    {rappelStatusLabels[r.status] ?? r.status}
                  </span>
                </div>
                <p className="mt-2 text-stone-600">
                  Facturación {formatPrice(Number(r.annualRevenue))} · Rappel{" "}
                  <strong>{formatPrice(Number(r.rebateAmount))}</strong>
                </p>
                {r.status === "PENDING" ? (
                  <p className="mt-1 text-xs text-amber-700">
                    Vence el {formatDate(r.dueAt)}
                  </p>
                ) : null}
                {r.status === "PAID" && r.paidAt ? (
                  <p className="mt-1 text-xs text-stone-500">
                    Abonado el {formatDate(r.paidAt)}
                    {r.paymentMethod === "TRANSFER"
                      ? " · transferencia"
                      : r.paymentMethod === "PAYOUT_OFFSET"
                        ? " · compensación en liquidaciones"
                        : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
