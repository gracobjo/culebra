import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";

export const metadata = { title: "Rentabilidad | Admin" };

// ---------------------------------------------------------------------------
// Estructura de costes por transacción (configurables)
// ---------------------------------------------------------------------------

/**
 * Costes imputables a cada transacción según el plan de negocio.
 *
 * Fuentes:
 *  - Amortización maquinaria: el plan prevé 3.000 € de hardware + equipo logístico
 *    (báscula + impresora étiquetas) amortizados en 3 años → 1.000 €/año.
 *    Estimando 500 transacciones/año en escenario conservador → 2 €/transacción.
 *  - Material de envasado: caja doble canal + separadores de vidrio + cinta:
 *    coste estimado 1,80 €/paquete (precio franquicia Correos rural).
 *  - Transporte / etiqueta Correos: tarifa plana negociada 4,50-5,50 €;
 *    usamos el punto medio 5,00 € como coste directo imputable al marketplace
 *    en consolidaciones (no repercutidas al cliente en su totalidad).
 *  - Comisión Stripe (processing fee): 1,4% + 0,25 € para cartas europeas.
 *    Se calcula dinámicamente sobre el importe bruto de cada pedido.
 *  - Coste infraestructura cloud: plan prevé 2.000 €/año → 0,20 €/tx (500 tx/año).
 *  - Coste soporte / gestoría imputable: 1.800 €/año → 0,36 €/tx.
 *
 * Todos estos valores son editables aquí para ajustarlos a la realidad mensual.
 */
const COST_CONFIG = {
  /** Amortización maquinaria (báscula, impresora etiquetas, NAS) €/tx */
  amortizacionMaquinaria: 2.0,
  /** Material de envasado (caja, separadores, precinto) €/tx */
  envasado: 1.8,
  /** Coste logístico imputable al marketplace (diferencia entre tarifa cobrada y coste real) €/tx */
  transporte: 0.5,
  /** Infraestructura cloud €/tx (estimado anual ÷ volumen esperado) */
  cloud: 0.2,
  /** Gestoría / tasas anuales ÷ volumen €/tx */
  gestoria: 0.36,
  /** Comisión Stripe: porcentaje sobre bruto (1,4% tarjetas europeas) */
  stripePercent: 0.014,
  /** Comisión Stripe: parte fija €/tx */
  stripeFixed: 0.25,
} as const;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type TransactionRow = {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  totalAmount: number;
  commission: number;
  vendorNetTotal: number;
  // Costes imputados
  costoStripe: number;
  costoMaquinaria: number;
  costoEnvasado: number;
  costoTransporte: number;
  costoCloud: number;
  costoGestoria: number;
  costoTotal: number;
  // Resultado
  beneficioNeto: number;
  margen: number; // %
};

type VendorSummary = {
  vendorId: string;
  tradeName: string;
  city: string | null;
  totalBruto: number;
  totalComision: number;
  costoTotal: number;
  beneficioNeto: number;
  txCount: number;
  margenMedio: number;
};

// ---------------------------------------------------------------------------
// Cálculo
// ---------------------------------------------------------------------------

async function computeTransactions(
  limit = 100,
): Promise<{ rows: TransactionRow[]; vendorSummaries: VendorSummary[] }> {
  const payouts = await prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      vendorOrder: {
        include: {
          order: { select: { id: true, orderNumber: true, totalAmount: true, createdAt: true } },
        },
      },
      vendor: { select: { id: true, tradeName: true, city: true } },
    },
  });

  const rows: TransactionRow[] = payouts.map((p) => {
    const totalAmount = Number(p.vendorOrder.order.totalAmount);
    const commission = Number(p.commissionMarketplace);

    const costoStripe = totalAmount * COST_CONFIG.stripePercent + COST_CONFIG.stripeFixed;
    const costoMaquinaria = COST_CONFIG.amortizacionMaquinaria;
    const costoEnvasado = COST_CONFIG.envasado;
    const costoTransporte = COST_CONFIG.transporte;
    const costoCloud = COST_CONFIG.cloud;
    const costoGestoria = COST_CONFIG.gestoria;
    const costoTotal =
      costoStripe + costoMaquinaria + costoEnvasado + costoTransporte + costoCloud + costoGestoria;

    const beneficioNeto = commission - costoTotal;
    const margen = commission > 0 ? (beneficioNeto / commission) * 100 : 0;

    return {
      orderId: p.vendorOrder.order.id,
      orderNumber: p.vendorOrder.order.orderNumber,
      createdAt: p.vendorOrder.order.createdAt,
      totalAmount,
      commission,
      vendorNetTotal: Number(p.amountNetToVendor),
      costoStripe: round2(costoStripe),
      costoMaquinaria,
      costoEnvasado,
      costoTransporte,
      costoCloud,
      costoGestoria,
      costoTotal: round2(costoTotal),
      beneficioNeto: round2(beneficioNeto),
      margen: round2(margen),
    };
  });

  // Agrupación por vendor
  const byVendor = new Map<string, { vendor: { id: string; tradeName: string; city: string | null }; txs: TransactionRow[] }>();
  for (const payout of payouts) {
    const v = payout.vendor;
    if (!byVendor.has(v.id)) byVendor.set(v.id, { vendor: v, txs: [] });
  }
  for (const row of rows) {
    const payout = payouts.find((p) => p.vendorOrder.order.orderNumber === row.orderNumber);
    if (payout) {
      byVendor.get(payout.vendor.id)?.txs.push(row);
    }
  }

  const vendorSummaries: VendorSummary[] = [...byVendor.entries()].map(([, { vendor, txs }]) => {
    const totalBruto = sum(txs, (r) => r.totalAmount);
    const totalComision = sum(txs, (r) => r.commission);
    const costoTotal = sum(txs, (r) => r.costoTotal);
    const beneficioNeto = sum(txs, (r) => r.beneficioNeto);
    const margenMedio = totalComision > 0 ? (beneficioNeto / totalComision) * 100 : 0;
    return {
      vendorId: vendor.id,
      tradeName: vendor.tradeName,
      city: vendor.city,
      totalBruto: round2(totalBruto),
      totalComision: round2(totalComision),
      costoTotal: round2(costoTotal),
      beneficioNeto: round2(beneficioNeto),
      txCount: txs.length,
      margenMedio: round2(margenMedio),
    };
  });

  return { rows, vendorSummaries };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function sum<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}
function euros(n: number): string {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
function pct(n: number): string {
  return n.toFixed(1) + " %";
}
function marginColor(margen: number): string {
  if (margen >= 50) return "text-emerald-700";
  if (margen >= 20) return "text-amber-700";
  return "text-red-700";
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

function CostBreakdown({ totalAmount }: { totalAmount: number }) {
  const c = COST_CONFIG;
  const stripe = round2(totalAmount * c.stripePercent + c.stripeFixed);
  const total = round2(stripe + c.amortizacionMaquinaria + c.envasado + c.transporte + c.cloud + c.gestoria);
  return (
    <table className="w-full text-xs">
      <tbody>
        {[
          ["Stripe (1,4% + 0,25 €)", euros(stripe)],
          ["Amort. maquinaria", euros(c.amortizacionMaquinaria)],
          ["Material envasado", euros(c.envasado)],
          ["Diferencial logístico", euros(c.transporte)],
          ["Infraestructura cloud", euros(c.cloud)],
          ["Gestoría / tasas", euros(c.gestoria)],
        ].map(([label, value]) => (
          <tr key={label} className="border-b border-stone-100 last:border-0">
            <td className="py-1 text-stone-500">{label}</td>
            <td className="py-1 text-right font-medium">{value}</td>
          </tr>
        ))}
        <tr className="font-semibold text-stone-800">
          <td className="pt-2">Total costes</td>
          <td className="pt-2 text-right">{euros(total)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default async function AdminRentabilidadPage() {
  await requireAdmin();
  const { rows, vendorSummaries } = await computeTransactions(200);

  const totalComision = round2(sum(rows, (r) => r.commission));
  const totalCostes = round2(sum(rows, (r) => r.costoTotal));
  const totalBeneficio = round2(sum(rows, (r) => r.beneficioNeto));
  const margenGlobal = totalComision > 0 ? round2((totalBeneficio / totalComision) * 100) : 0;
  const avgTicket = rows.length > 0 ? round2(sum(rows, (r) => r.totalAmount) / rows.length) : 0;

  const costoUnitarioBase = round2(
    COST_CONFIG.amortizacionMaquinaria +
      COST_CONFIG.envasado +
      COST_CONFIG.transporte +
      COST_CONFIG.cloud +
      COST_CONFIG.gestoria,
  );

  return (
    <AdminShell title="Rentabilidad por transacción">
      <div className="space-y-8">
        {/* ---------- KPIs globales ---------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Ingresos por comisiones", value: euros(totalComision), sub: "acumulado" },
            { label: "Costes imputados", value: euros(totalCostes), sub: "acumulado" },
            {
              label: "Beneficio neto marketplace",
              value: euros(totalBeneficio),
              sub: `margen ${pct(margenGlobal)}`,
              highlight: true,
            },
            { label: "Ticket medio pedido", value: euros(avgTicket), sub: `${rows.length} transacciones` },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl border p-5 ${card.highlight ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-white"}`}
            >
              <p className="text-sm text-stone-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${card.highlight ? "text-emerald-800" : ""}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-stone-400">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ---------- Desglose de costes unitarios ---------- */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">Estructura de costes por transacción</h2>
          <p className="mt-1 text-sm text-stone-500">
            Costes fijos imputables independientemente del importe del pedido.
            Los costes Stripe son variables sobre el bruto.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium text-stone-700">Para un pedido de {euros(avgTicket || 30)}</p>
              <CostBreakdown totalAmount={avgTicket || 30} />
            </div>
            <div className="rounded-2xl bg-stone-50 p-4 text-sm">
              <p className="font-medium text-stone-800">Costes fijos unitarios</p>
              <p className="mt-1 text-stone-500">
                Amort. maquinaria + envasado + logístico + cloud + gestoría =
                <span className="ml-1 font-semibold text-stone-800">{euros(costoUnitarioBase)}</span>
              </p>
              <p className="mt-3 font-medium text-stone-800">Punto de equilibrio de la comisión</p>
              <p className="mt-1 text-stone-500">
                Con un pedido de <strong>15 €</strong>, la comisión al 15% es 2,25 €.
                El coste Stripe sería 0,46 €. Total costes ≈ {euros(costoUnitarioBase + 0.46)}.{" "}
                <span className="text-red-600 font-medium">Beneficio negativo.</span>
              </p>
              <p className="mt-1 text-stone-500">
                Con un pedido de <strong>{euros(avgTicket || 45)}</strong> (ticket medio actual),
                la comisión al 15% cubre los costes y genera margen positivo.
              </p>
              <p className="mt-3 text-xs text-stone-400">
                Recomendación: importe mínimo de pedido ≥ 30 € para garantizar beneficio en todos
                los tramos de comisión.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- Resumen por artesano ---------- */}
        {vendorSummaries.length > 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-6 py-4">
              <h2 className="text-base font-semibold">Rentabilidad por artesano</h2>
              <p className="mt-1 text-sm text-stone-500">
                Desglose de comisiones, costes imputados y beneficio neto por productor.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    {["Artesano", "Pedidos", "Bruto ventas", "Comisión (15%)", "Costes imputados", "Beneficio neto", "Margen"].map(
                      (h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>,
                    )}
                  </tr>
                </thead>
                <tbody>
                  {vendorSummaries
                    .sort((a, b) => b.totalComision - a.totalComision)
                    .map((v) => (
                      <tr key={v.vendorId} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{v.tradeName}</p>
                          {v.city ? <p className="text-xs text-stone-400">{v.city}</p> : null}
                        </td>
                        <td className="px-4 py-3 text-center">{v.txCount}</td>
                        <td className="px-4 py-3">{euros(v.totalBruto)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">{euros(v.totalComision)}</td>
                        <td className="px-4 py-3 text-red-600">− {euros(v.costoTotal)}</td>
                        <td className={`px-4 py-3 font-semibold ${v.beneficioNeto >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                          {euros(v.beneficioNeto)}
                        </td>
                        <td className={`px-4 py-3 font-medium ${marginColor(v.margenMedio)}`}>
                          {pct(v.margenMedio)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* ---------- Historial de transacciones ---------- */}
        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
            Aún no hay transacciones liquidadas. Los datos aparecerán cuando existan pedidos pagados.
          </p>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-6 py-4">
              <h2 className="text-base font-semibold">
                Historial de transacciones ({rows.length} últimas)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    {[
                      "Pedido",
                      "Fecha",
                      "Bruto",
                      "Comisión",
                      "Stripe",
                      "Maquinaria",
                      "Envasado",
                      "Transporte",
                      "Cloud+Gestoria",
                      "Total costes",
                      "Beneficio",
                      "Margen",
                    ].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.orderId + row.orderNumber} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-3 py-2 font-medium text-emerald-800">{row.orderNumber}</td>
                      <td className="px-3 py-2 text-stone-500">
                        {row.createdAt.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </td>
                      <td className="px-3 py-2">{euros(row.totalAmount)}</td>
                      <td className="px-3 py-2 text-emerald-700">{euros(row.commission)}</td>
                      <td className="px-3 py-2 text-red-500">−{euros(row.costoStripe)}</td>
                      <td className="px-3 py-2 text-red-500">−{euros(row.costoMaquinaria)}</td>
                      <td className="px-3 py-2 text-red-500">−{euros(row.costoEnvasado)}</td>
                      <td className="px-3 py-2 text-red-500">−{euros(row.costoTransporte)}</td>
                      <td className="px-3 py-2 text-red-500">−{euros(row.costoCloud + row.costoGestoria)}</td>
                      <td className="px-3 py-2 font-medium text-red-600">−{euros(row.costoTotal)}</td>
                      <td className={`px-3 py-2 font-semibold ${row.beneficioNeto >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {euros(row.beneficioNeto)}
                      </td>
                      <td className={`px-3 py-2 font-medium ${marginColor(row.margen)}`}>
                        {pct(row.margen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
