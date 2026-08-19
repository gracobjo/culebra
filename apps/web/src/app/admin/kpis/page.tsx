import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";

export const metadata = { title: "KPIs Artesanos | Admin" };

// ---------------------------------------------------------------------------
// Tipos y constantes de KPIs
// ---------------------------------------------------------------------------

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
    description: "Porcentaje de subpedidos confirmados en menos de 24 horas desde la recepcion.",
    unit: "%",
    targetLabel: "> 95 %",
    criticalLabel: "< 90 % — Suspension temporal de cuenta",
    targetDirection: "above",
    targetValue: 95,
    criticalValue: 90,
    consequence: "Suspension temporal de cuenta",
  },
  {
    id: "stock_breakage",
    label: "Ratio de roturas de stock",
    description: "Porcentaje de lineas de pedido canceladas por falta de stock.",
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
    description: "Porcentaje de envios con reclamacion de embalaje inadecuado.",
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
    label: "Puntuacion media de valoraciones",
    description: "Media de puntuaciones de compradores sobre los productos del artesano.",
    unit: "/ 5",
    targetLabel: "> 4.5 / 5",
    criticalLabel: "< 4.0 — Revision tecnica del producto",
    targetDirection: "above",
    targetValue: 4.5,
    criticalValue: 4.0,
    consequence: "Revision tecnica del producto",
  },
];

// ---------------------------------------------------------------------------
// Calculo de valores reales desde la BD
// ---------------------------------------------------------------------------

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
    // Pedidos a tiempo: % de VendorOrders confirmados en <24h desde la creacion
    const allVendorOrders = await prisma.vendorOrder.findMany({
      where: { vendorId: vendor.id },
      select: { id: true, createdAt: true, updatedAt: true, status: true },
    });

    const totalOrders = allVendorOrders.length;

    let onTimePct = 100;
    if (totalOrders > 0) {
      const onTimeCount = allVendorOrders.filter((vo) => {
        if (vo.status === "CANCELLED") return true; // no cuentan
        const diffMs = vo.updatedAt.getTime() - vo.createdAt.getTime();
        const diffH = diffMs / (1000 * 60 * 60);
        // Si no ha cambiado de estado y lleva mas de 24h -> tarde
        if (vo.status === "PENDING" && diffH > 24) return false;
        // Si confirmo en <24h -> a tiempo
        return diffH <= 24;
      }).length;
      onTimePct = totalOrders > 0 ? Math.round((onTimeCount / totalOrders) * 100) : 100;
    }

    // Roturas de stock: OrderItems cancelados / total orderItems del vendor
    const totalItems = await prisma.orderItem.count({ where: { vendorId: vendor.id } });
    // Aproximacion: pedidos CANCELLED con el vendor
    const cancelledOrders = await prisma.vendorOrder.count({
      where: { vendorId: vendor.id, status: "CANCELLED" },
    });
    const stockBreakPct =
      totalItems > 0 ? Math.round((cancelledOrders / totalItems) * 100 * 10) / 10 : 0;

    // Incidencias de embalaje: no hay campo directo; usamos 0 para seed demo
    const packagingPct = 0;

    // Puntuacion media de reviews
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
  } else {
    if (value <= kpi.targetValue) return "ok";
    if (value <= kpi.criticalValue) return "warning";
    return "critical";
  }
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
  warning: "Atencion",
  critical: "Critico",
};

// ---------------------------------------------------------------------------
// Componentes de presentacion
// ---------------------------------------------------------------------------

function KpiLegend() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <h2 className="text-base font-semibold">Objetivos del cuadro de mando mensual</h2>
      <p className="mt-1 text-sm text-stone-500">
        Evaluacion mensual de artesanos locales de Zamora para decision de permanencia en la plataforma.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <th className="pb-3 pr-4 font-medium">KPI</th>
              <th className="pb-3 pr-4 font-medium">Objetivo (Target)</th>
              <th className="pb-3 font-medium">Nivel critico (Apercibimiento)</th>
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
          <span key={s} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${statusColors[s]}`}>
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

// ---------------------------------------------------------------------------
// Pagina principal
// ---------------------------------------------------------------------------

export default async function AdminKpisPage() {
  await requireAdmin();
  const rows = await computeVendorKpis();

  const totalCritical = rows.reduce((acc, row) => {
    return (
      acc +
      KPI_DEFINITIONS.filter((kpi) => getKpiStatus(kpi, row.kpis[kpi.id]!) === "critical").length
    );
  }, 0);

  const totalWarning = rows.reduce((acc, row) => {
    return (
      acc +
      KPI_DEFINITIONS.filter((kpi) => getKpiStatus(kpi, row.kpis[kpi.id]!) === "warning").length
    );
  }, 0);

  return (
    <AdminShell title="KPIs — Evaluacion de artesanos">
      <div className="space-y-6">
        {/* Resumen de alertas */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Artesanos evaluados</p>
            <p className="mt-2 text-3xl font-semibold">{rows.length}</p>
          </div>
          <div className={`rounded-3xl border p-5 ${totalWarning > 0 ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-white"}`}>
            <p className="text-sm text-stone-500">Alertas de atencion</p>
            <p className={`mt-2 text-3xl font-semibold ${totalWarning > 0 ? "text-amber-700" : ""}`}>
              {totalWarning}
            </p>
          </div>
          <div className={`rounded-3xl border p-5 ${totalCritical > 0 ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"}`}>
            <p className="text-sm text-stone-500">Indicadores criticos</p>
            <p className={`mt-2 text-3xl font-semibold ${totalCritical > 0 ? "text-red-700" : ""}`}>
              {totalCritical}
            </p>
          </div>
        </div>

        {/* Leyenda de objetivos */}
        <KpiLegend />

        {/* Tabla de KPIs por artesano */}
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
                      <th key={kpi.id} className="px-4 py-3 text-center font-medium text-stone-700">
                        <span className="block max-w-[140px] leading-snug">{kpi.label}</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-medium text-stone-700">Estado global</th>
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
                      <tr key={row.vendorId} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-900">{row.tradeName}</p>
                          {row.city ? (
                            <p className="text-xs text-stone-500">{row.city}{row.province ? `, ${row.province}` : ""}</p>
                          ) : null}
                        </td>
                        {KPI_DEFINITIONS.map((kpi) => (
                          <KpiCell key={kpi.id} kpi={kpi} value={row.kpis[kpi.id]!} />
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[globalStatus]}`}
                          >
                            <span className={`inline-block h-2 w-2 rounded-full ${statusDot[globalStatus]}`} />
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

        {/* Acciones sugeridas */}
        {totalCritical > 0 && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-800">Acciones requeridas este mes</h3>
            <ul className="mt-3 space-y-2 text-sm text-red-700">
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
      </div>
    </AdminShell>
  );
}
