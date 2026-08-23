import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import {
  computePlatformRiskMetrics,
  vendorOrderOnTime,
  type PlatformRiskMetrics,
  type RiskAlertLevel,
} from "@/lib/admin-risk-metrics";

export const metadata = { title: "KPIs y riesgos | Admin" };

type KpiStatus = "ok" | "warning" | "critical";

type KpiDefinition = {
  id: string;
  label: string;
  description: string;
  unit: string;
  targetLabel: string;
  criticalLabel: string;
  targetDirection: "above" | "below";
  targetValue: number;
  criticalValue: number;
  consequence: string;
};

const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    id: "on_time_preparation",
    label: "Pedidos preparados a tiempo (<24h)",
    description: "Porcentaje de subpedidos cumpliendo SLA (campos SLA o <24 h desde creación).",
    unit: "%",
    targetLabel: "> 95 %",
    criticalLabel: "< 90 % — Suspensión temporal de cuenta",
    targetDirection: "above",
    targetValue: 95,
    criticalValue: 90,
    consequence: "Suspensión temporal de cuenta",
  },
  {
    id: "stock_breakage",
    label: "Ratio de roturas de stock",
    description: "Porcentaje de subpedidos cancelados respecto al total del productor.",
    unit: "%",
    targetLabel: "< 1 %",
    criticalLabel: "> 3 % — Retirada del producto de la web",
    targetDirection: "below",
    targetValue: 1,
    criticalValue: 3,
    consequence: "Retirada del producto de la web",
  },
  {
    id: "packaging_incidents",
    label: "Incidencias por embalaje defectuoso",
    description: "Porcentaje de envíos con reclamación de embalaje inadecuado.",
    unit: "%",
    targetLabel: "0 %",
    criticalLabel: "> 2 % — Obligatoriedad de empaquetar en tienda",
    targetDirection: "below",
    targetValue: 0,
    criticalValue: 2,
    consequence: "Obligatoriedad de empaquetar en tienda",
  },
  {
    id: "avg_rating",
    label: "Puntuación media de valoraciones",
    description: "Media de puntuaciones de compradores sobre los productos del artesano.",
    unit: "/ 5",
    targetLabel: "> 4.5 / 5",
    criticalLabel: "< 4.0 — Revisión técnica del producto",
    targetDirection: "above",
    targetValue: 4.5,
    criticalValue: 4.0,
    consequence: "Revisión técnica del producto",
  },
];

type VendorKpiRow = {
  vendorId: string;
  tradeName: string;
  slug: string;
  city: string | null;
  province: string | null;
  kpis: Record<string, number>;
};

async function computeVendorKpis(): Promise<VendorKpiRow[]> {
  const vendors = await prisma.vendor.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    select: { id: true, tradeName: true, slug: true, city: true, province: true },
    orderBy: { tradeName: "asc" },
  });

  const rows: VendorKpiRow[] = [];

  for (const vendor of vendors) {
    const allVendorOrders = await prisma.vendorOrder.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        slaStatus: true,
        slaReceivedAt: true,
        slaDeadlineAt: true,
      },
    });

    const scored = allVendorOrders.filter(
      (vo) => vo.status !== "CANCELLED" && vo.status !== "RETURNED"
    );
    let onTimePct = 100;
    if (scored.length > 0) {
      const onTimeCount = scored.filter((vo) => vendorOrderOnTime(vo)).length;
      onTimePct = Math.round((onTimeCount / scored.length) * 100);
    }

    const totalOrders = allVendorOrders.length;
    const cancelledOrders = allVendorOrders.filter((vo) => vo.status === "CANCELLED").length;
    const stockBreakPct =
      totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100 * 10) / 10 : 0;

    const packagingPct = 0;

    const reviews = await prisma.review.findMany({
      where: { vendorId: vendor.id },
      select: { rating: true },
    });
    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    rows.push({
      vendorId: vendor.id,
      tradeName: vendor.tradeName,
      slug: vendor.slug,
      city: vendor.city,
      province: vendor.province,
      kpis: {
        on_time_preparation: onTimePct,
        stock_breakage: stockBreakPct,
        packaging_incidents: packagingPct,
        avg_rating: avgRating ?? 5,
      },
    });
  }

  return rows;
}

function getKpiStatus(kpi: KpiDefinition, value: number): KpiStatus {
  if (kpi.targetDirection === "above") {
    if (value >= kpi.targetValue) return "ok";
    if (value >= kpi.criticalValue) return "warning";
    return "critical";
  }
  if (value <= kpi.targetValue) return "ok";
  if (value <= kpi.criticalValue) return "warning";
  return "critical";
}

const statusColors: Record<KpiStatus, string> = {
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-800 border-red-200",
};

const statusDot: Record<KpiStatus, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-400",
  critical: "bg-red-500",
};

const statusLabel: Record<KpiStatus, string> = {
  ok: "Cumple",
  warning: "Atención",
  critical: "Crítico",
};

function formatMonthLabel(from: Date): string {
  return from.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function RiskDashboard({ metrics }: { metrics: PlatformRiskMetrics }) {
  const worst: RiskAlertLevel = metrics.alerts.some((a) => a.level === "critical")
    ? "critical"
    : metrics.alerts.some((a) => a.level === "warning")
      ? "warning"
      : "ok";

  return (
    <section className="space-y-4" aria-labelledby="risks-heading">
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="risks-heading" className="text-base font-semibold text-stone-900">
              Riesgos del modelo multimarca
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Medición mensual ({formatMonthLabel(metrics.monthFrom)}) · multi-homing,
              SLA e incidencias, concentración de GMV. Umbrales: incidencias &gt;10/15 %,
              top 3 GMV &gt;65/70 %, máx. productor &gt;25/30 %.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[worst]}`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${statusDot[worst]}`} />
            {statusLabel[worst]}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 ${statusColors[alert.level]}`}
            >
              <p className="text-xs font-medium opacity-80">{alert.label}</p>
              <p className="mt-2 text-xl font-semibold tabular-nums">{alert.valueLabel}</p>
              <p className="mt-1 text-[11px] opacity-70">{alert.thresholdLabel}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-stone-500">Pedidos pagados (mes)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{metrics.ordersPaidMonth}</p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-stone-500">% multiproductor</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {metrics.multiproducerPct} %
            </p>
            <p className="text-xs text-stone-400">
              {metrics.multiproducerOrdersMonth} de {metrics.ordersPaidMonth}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-stone-500">GMV merchandise (mes)</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {metrics.gmvMonthEur.toLocaleString("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              €
            </p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-stone-500">Desglose incidencias</p>
            <p className="mt-1 text-sm text-stone-800">
              SLA: {metrics.slaBreachedMonth} · Tarde: {metrics.latePrepMonth} ·
              Cancel.: {metrics.cancelledMonth}
            </p>
            <p className="text-xs text-stone-400">
              {metrics.incidentVendorOrdersMonth} / {metrics.vendorOrdersMonth} subpedidos
            </p>
          </div>
        </div>
      </div>

      {metrics.vendorShares.length > 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-stone-900">
            Concentración GMV por productor (mes)
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Objetivo diversificación: ningún productor &gt; 25–30 % del GMV.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">Productor</th>
                  <th className="pb-2 pr-4 font-medium text-right">GMV</th>
                  <th className="pb-2 font-medium text-right">Cuota</th>
                </tr>
              </thead>
              <tbody>
                {metrics.vendorShares.slice(0, 10).map((row, i) => {
                  const level: KpiStatus =
                    row.sharePct > 30 ? "critical" : row.sharePct > 25 ? "warning" : "ok";
                  return (
                    <tr key={row.vendorId} className="border-b border-stone-100 last:border-0">
                      <td className="py-2.5 pr-4 text-stone-400">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-stone-800">{row.tradeName}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {row.gmvEur.toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[level]}`}
                        >
                          {row.sharePct} %
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
          Sin GMV en el mes en curso. Las alertas de concentración aparecerán con los
          primeros pedidos pagados.
        </p>
      )}
    </section>
  );
}

function KpiLegend() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <h2 className="text-base font-semibold">KPIs por artesano (cuadro mensual)</h2>
      <p className="mt-1 text-sm text-stone-500">
        Evaluación de permanencia. Ver también riesgos de plataforma arriba.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <th className="pb-3 pr-4 font-medium">KPI</th>
              <th className="pb-3 pr-4 font-medium">Objetivo</th>
              <th className="pb-3 font-medium">Nivel crítico</th>
            </tr>
          </thead>
          <tbody>
            {KPI_DEFINITIONS.map((kpi) => (
              <tr key={kpi.id} className="border-b border-stone-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-stone-800">{kpi.label}</td>
                <td className="py-3 pr-4 text-emerald-700">{kpi.targetLabel}</td>
                <td className="py-3 text-red-700">{kpi.criticalLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {(["ok", "warning", "critical"] as KpiStatus[]).map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${statusColors[s]}`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${statusDot[s]}`} />
            {statusLabel[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

function KpiCell({ kpi, value }: { kpi: KpiDefinition; value: number }) {
  const status = getKpiStatus(kpi, value);
  const noData = value === 5 && kpi.id === "avg_rating";
  return (
    <td className="px-4 py-3 text-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
        title={status === "critical" ? kpi.consequence : undefined}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
        {noData ? "—" : `${value}${kpi.unit}`}
      </span>
    </td>
  );
}

export default async function AdminKpisPage() {
  await requireAdmin();
  const [rows, riskMetrics] = await Promise.all([
    computeVendorKpis(),
    computePlatformRiskMetrics(),
  ]);

  const totalCritical = rows.reduce((acc, row) => {
    return (
      acc +
      KPI_DEFINITIONS.filter((kpi) => getKpiStatus(kpi, row.kpis[kpi.id]!) === "critical")
        .length
    );
  }, 0);

  const totalWarning = rows.reduce((acc, row) => {
    return (
      acc +
      KPI_DEFINITIONS.filter((kpi) => getKpiStatus(kpi, row.kpis[kpi.id]!) === "warning")
        .length
    );
  }, 0);

  const riskCritical = riskMetrics.alerts.filter((a) => a.level === "critical").length;
  const riskWarning = riskMetrics.alerts.filter((a) => a.level === "warning").length;

  return (
    <AdminShell title="KPIs y riesgos del modelo">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Artesanos evaluados</p>
            <p className="mt-2 text-3xl font-semibold">{rows.length}</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Activos con venta (90 d)</p>
            <p className="mt-2 text-3xl font-semibold">
              {riskMetrics.activeVendorsWithSales90d}
            </p>
          </div>
          <div
            className={`rounded-3xl border p-5 ${
              totalWarning + riskWarning > 0
                ? "border-amber-200 bg-amber-50"
                : "border-stone-200 bg-white"
            }`}
          >
            <p className="text-sm text-stone-500">Alertas de atención</p>
            <p
              className={`mt-2 text-3xl font-semibold ${
                totalWarning + riskWarning > 0 ? "text-amber-700" : ""
              }`}
            >
              {totalWarning + riskWarning}
            </p>
          </div>
          <div
            className={`rounded-3xl border p-5 ${
              totalCritical + riskCritical > 0
                ? "border-red-200 bg-red-50"
                : "border-stone-200 bg-white"
            }`}
          >
            <p className="text-sm text-stone-500">Indicadores críticos</p>
            <p
              className={`mt-2 text-3xl font-semibold ${
                totalCritical + riskCritical > 0 ? "text-red-700" : ""
              }`}
            >
              {totalCritical + riskCritical}
            </p>
          </div>
        </div>

        <RiskDashboard metrics={riskMetrics} />

        <KpiLegend />

        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-stone-300 p-8 text-center text-stone-600">
            No hay artesanos activos para evaluar.
          </p>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left">
                    <th className="px-4 py-3 font-medium text-stone-700">Artesano</th>
                    {KPI_DEFINITIONS.map((kpi) => (
                      <th
                        key={kpi.id}
                        className="px-4 py-3 text-center font-medium text-stone-700"
                      >
                        <span className="block max-w-[140px] leading-snug">{kpi.label}</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-medium text-stone-700">
                      Estado global
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const statuses = KPI_DEFINITIONS.map((kpi) =>
                      getKpiStatus(kpi, row.kpis[kpi.id]!)
                    );
                    const globalStatus: KpiStatus = statuses.includes("critical")
                      ? "critical"
                      : statuses.includes("warning")
                        ? "warning"
                        : "ok";

                    return (
                      <tr
                        key={row.vendorId}
                        className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{row.tradeName}</p>
                          {row.city ? (
                            <p className="text-xs text-stone-500">
                              {row.city}
                              {row.province ? `, ${row.province}` : ""}
                            </p>
                          ) : null}
                        </td>
                        {KPI_DEFINITIONS.map((kpi) => (
                          <KpiCell key={kpi.id} kpi={kpi} value={row.kpis[kpi.id]!} />
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[globalStatus]}`}
                          >
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${statusDot[globalStatus]}`}
                            />
                            {statusLabel[globalStatus]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(totalCritical > 0 || riskCritical > 0) && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-800">Acciones requeridas este mes</h3>
            <ul className="mt-3 space-y-2 text-sm text-red-700">
              {riskMetrics.alerts
                .filter((a) => a.level === "critical")
                .map((a) => (
                  <li key={a.id} className="flex gap-2">
                    <span className="shrink-0 font-medium">Plataforma:</span>
                    <span>
                      {a.label} — {a.valueLabel} ({a.thresholdLabel})
                    </span>
                  </li>
                ))}
              {rows.flatMap((row) =>
                KPI_DEFINITIONS.filter(
                  (kpi) => getKpiStatus(kpi, row.kpis[kpi.id]!) === "critical"
                ).map((kpi) => (
                  <li key={`${row.vendorId}-${kpi.id}`} className="flex gap-2">
                    <span className="shrink-0 font-medium">{row.tradeName}:</span>
                    <span>{kpi.consequence}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <p className="text-xs text-stone-500">
          Documentación:{" "}
          <code className="rounded bg-stone-100 px-1">docs/Riesgos_Modelo_Multimarca.md</code>
          {" · "}
          <code className="rounded bg-stone-100 px-1">docs/Flujo_Operativo_Piloto.md</code>
        </p>
      </div>
    </AdminShell>
  );
}
