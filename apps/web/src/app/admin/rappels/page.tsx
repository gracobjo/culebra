import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";

export const metadata = { title: "Rappels y Captación | Admin" };

// ---------------------------------------------------------------------------
// Plan de tramos de rappel
// ---------------------------------------------------------------------------

const RAPPEL_TIERS = [
  {
    id: "bronze",
    name: "Bronce",
    minRevenue: 0,
    maxRevenue: 5000,
    commissionPct: 15,
    effectivePct: 15,
    rebatePct: 0,
    color: "bg-amber-100 border-amber-200 text-amber-900",
    badge: "bg-amber-200 text-amber-900",
    perks: ["Acceso estándar a la plataforma", "Estadísticas básicas de ventas"],
    target: "Microproductores y artesanos estacionales. Ideal para empezar sin riesgo.",
  },
  {
    id: "silver",
    name: "Plata",
    minRevenue: 5001,
    maxRevenue: 15000,
    commissionPct: 15,
    effectivePct: 12,
    rebatePct: 3,
    color: "bg-slate-100 border-slate-200 text-slate-900",
    badge: "bg-slate-300 text-slate-900",
    perks: [
      "Abono del 3% sobre el tramo Plata al cierre del año natural",
      "Destacado en portada durante campaña navideña",
      "Inclusión en newsletter mensual a base de datos de Madrid",
    ],
    target: "Artesanos con producción regular. El rappel cubre gastos de transporte propios.",
  },
  {
    id: "gold",
    name: "Oro",
    minRevenue: 15001,
    maxRevenue: Infinity,
    commissionPct: 15,
    effectivePct: 10,
    rebatePct: 5,
    color: "bg-yellow-50 border-yellow-300 text-yellow-900",
    badge: "bg-yellow-300 text-yellow-900",
    perks: [
      "Abono del 5% sobre el tramo Oro (3% del tramo Plata + 2% adicional Oro)",
      "Banner rotatorio en portada permanente en temporada alta",
      "Espacio prioritario en todos los envíos de newsletter",
      "Gestión logística preferente (recogida en producción)",
      "Reunión trimestral de cuenta con socios S.L.",
    ],
    target:
      "Productores digitalizados que ya venden en su canal propio. La comisión efectiva del 10% es el argumento definitivo frente al 15% de Amazon sin cuotas ni logística FBA.",
  },
];

// ---------------------------------------------------------------------------
// Cálculo de rappels por vendor
// ---------------------------------------------------------------------------

type VendorRappelStatus = {
  vendorId: string;
  tradeName: string;
  city: string | null;
  annualRevenue: number;
  currentTier: (typeof RAPPEL_TIERS)[0];
  nextTier: (typeof RAPPEL_TIERS)[0] | null;
  remainingToNextTier: number;
  pendingRebate: number; // importe a abonar si cierra año en este tramo
  commissionCharged: number;
  effectiveCommission: number;
};

async function getVendorRappelStatuses(): Promise<VendorRappelStatus[]> {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const vendorOrders = await prisma.vendorOrder.groupBy({
    by: ["vendorId"],
    where: { createdAt: { gte: startOfYear } },
    _sum: { subtotalGross: true, marketplaceCommission: true },
  });

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorOrders.map((v) => v.vendorId) } },
    select: { id: true, tradeName: true, city: true },
  });

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  return vendorOrders.map((vo) => {
    const annualRevenue = Number(vo._sum.subtotalGross ?? 0);
    const commissionCharged = Number(vo._sum.marketplaceCommission ?? 0);
    const vendor = vendorMap.get(vo.vendorId)!;

    const currentTier =
      RAPPEL_TIERS.slice()
        .reverse()
        .find((t) => annualRevenue >= t.minRevenue) ?? RAPPEL_TIERS[0];

    const tierIndex = RAPPEL_TIERS.indexOf(currentTier);
    const nextTier = tierIndex < RAPPEL_TIERS.length - 1 ? RAPPEL_TIERS[tierIndex + 1] : null;

    const remainingToNextTier = nextTier ? Math.max(0, nextTier.minRevenue - annualRevenue) : 0;

    // Rappel: diferencia entre comisión cobrada y la comisión efectiva del tramo
    const pendingRebate =
      currentTier.rebatePct > 0
        ? round2((commissionCharged * currentTier.rebatePct) / currentTier.commissionPct)
        : 0;

    const effectiveCommission = annualRevenue > 0 ? round2((commissionCharged - pendingRebate) / annualRevenue * 100) : 15;

    return {
      vendorId: vo.vendorId,
      tradeName: vendor?.tradeName ?? "—",
      city: vendor?.city ?? null,
      annualRevenue: round2(annualRevenue),
      currentTier,
      nextTier,
      remainingToNextTier: round2(remainingToNextTier),
      pendingRebate,
      commissionCharged: round2(commissionCharged),
      effectiveCommission,
    };
  });
}

// ---------------------------------------------------------------------------
// Análisis competitivo (estático, informativo)
// ---------------------------------------------------------------------------

const COMPETITIVE_ANALYSIS = [
  {
    competitor: "Amazon Alimentación",
    commission: "15% (ref.) + 39 €/mes + FBA + publicidad interna",
    effective: "~22–28%",
    verdict: "Más caro en cómputo real",
    color: "text-red-700",
  },
  {
    competitor: "Mentta / Correos Market",
    commission: "15–22% según volumen",
    effective: "15–22%",
    verdict: "Comparable sin extras",
    color: "text-amber-700",
  },
  {
    competitor: "Distribución tradicional",
    commission: "35–50% margen del retailer",
    effective: "35–50%",
    verdict: "Muy inferior para el productor",
    color: "text-red-700",
  },
  {
    competitor: "Sierra de la Culebra Marketplace",
    commission: "15% todo incluido (efectivo 10–15% con rappel)",
    effective: "10–15%",
    verdict: "✓ El más competitivo",
    color: "text-emerald-700",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function euros(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

export default async function AdminRappelsPage() {
  await requireAdmin();
  const vendorStatuses = await getVendorRappelStatuses();

  const totalPendingRebates = vendorStatuses.reduce((acc, v) => acc + v.pendingRebate, 0);

  return (
    <AdminShell title="Sistema de Rappels y Estrategia de Captación">
      <div className="space-y-10">
        {/* ---------- Tabla de tramos ---------- */}
        <div>
          <h2 className="text-base font-semibold">Plan de tramos de comisión</h2>
          <p className="mt-1 text-sm text-stone-500">
            Siempre se cobra el 15% en cada transacción vía Stripe Connect. Al cierre del año
            natural se calcula el tramo alcanzado y se emite el abono correspondiente.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {RAPPEL_TIERS.map((tier) => (
              <div key={tier.id} className={`rounded-3xl border p-5 ${tier.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tier.badge}`}>
                    {tier.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {tier.maxRevenue === Infinity
                      ? `> ${euros(tier.minRevenue - 1)}/año`
                      : `${euros(tier.minRevenue - 1)} – ${euros(tier.maxRevenue)}/año`}
                  </span>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Comisión cobrada</span>
                    <span className="font-semibold">{tier.commissionPct}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Comisión efectiva</span>
                    <span className="font-semibold text-emerald-800">{tier.effectivePct}%</span>
                  </div>
                  {tier.rebatePct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Rappel (abono anual)</span>
                      <span className="font-semibold">−{tier.rebatePct}%</span>
                    </div>
                  )}
                </div>
                <ul className="mt-4 space-y-1 text-xs opacity-80">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex gap-1">
                      <span>•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-2xl bg-white/50 p-2 text-xs italic">{tier.target}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Estado actual de artesanos ---------- */}
        <div className="rounded-3xl border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold">Estado de artesanos — año {new Date().getFullYear()}</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Facturación acumulada, tramo actual y rappel pendiente de abono.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
              <span className="text-stone-500">Total rappels a abonar:</span>
              <span className="ml-2 font-semibold text-amber-800">{euros(totalPendingRebates)}</span>
            </div>
          </div>

          {vendorStatuses.length === 0 ? (
            <p className="p-8 text-center text-stone-500">
              No hay ventas registradas aún en {new Date().getFullYear()}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    {[
                      "Artesano",
                      "Facturación anual",
                      "Tramo",
                      "Comisión cobrada",
                      "Comisión efectiva",
                      "Rappel a abonar",
                      "Para subir de tramo",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendorStatuses
                    .sort((a, b) => b.annualRevenue - a.annualRevenue)
                    .map((v) => (
                      <tr key={v.vendorId} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{v.tradeName}</p>
                          {v.city ? <p className="text-xs text-stone-400">{v.city}</p> : null}
                        </td>
                        <td className="px-4 py-3 font-medium">{euros(v.annualRevenue)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.currentTier.badge}`}
                          >
                            {v.currentTier.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">{euros(v.commissionCharged)}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">
                          {v.effectiveCommission.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-700">
                          {v.pendingRebate > 0 ? euros(v.pendingRebate) : "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-400">
                          {v.nextTier
                            ? `${euros(v.remainingToNextTier)} para ${v.nextTier.name}`
                            : "✓ Tramo máximo"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---------- Análisis competitivo ---------- */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">Análisis de competitividad de la tarifa</h2>
          <p className="mt-1 text-sm text-stone-500">
            ¿Por qué el 15% todo incluido es el argumento más poderoso frente a la competencia?
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                  {["Canal / Competidor", "Estructura de coste", "Comisión real efectiva", "Valoración"].map(
                    (h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>,
                  )}
                </tr>
              </thead>
              <tbody>
                {COMPETITIVE_ANALYSIS.map((row) => (
                  <tr key={row.competitor} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.competitor}</td>
                    <td className="px-4 py-3 text-stone-500">{row.commission}</td>
                    <td className={`px-4 py-3 font-semibold ${row.color}`}>{row.effective}</td>
                    <td className={`px-4 py-3 font-medium ${row.color}`}>{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- Motivos de captación ---------- */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">
            Por qué un productor ya digitalizado elegiría este marketplace
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Argumentos de captación frente a artesanos con ecommerce propio activo.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "📉",
                title: "CAC cero (Coste de Adquisición de Cliente)",
                body: "El CAC medio en gourmet supera los 15 € por cliente en Google/Meta Ads. En el marketplace el productor tiene riesgo publicitario nulo: solo paga si vende.",
              },
              {
                icon: "🛒",
                title: "Efecto cesta unificada (venta cruzada)",
                body: 'Un chorizo de 11 € con 6 € de envío "cuesta" +50% al cliente. En el marketplace ese mismo cliente añade queso y miel: el envío se comparte y el ticket medio sube.',
              },
              {
                icon: "🔍",
                title: "SEO de territorio y marca colectiva",
                body: "El portal se posiciona como referente de Sierra de la Culebra–La Raya. Una web individual de artesano jamás puede competir en autoridad de dominio con un marketplace especializado.",
              },
              {
                icon: "📦",
                title: "Externalización logística",
                body: "Depositar el stock en la trastienda de Villardeciervos libera al productor de empaquetar y esperar al mensajero, recuperando horas de producción cada día.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                <p className="text-lg">{item.icon}</p>
                <p className="mt-2 font-medium text-stone-800">{item.title}</p>
                <p className="mt-1 text-sm text-stone-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Mecánica operativa ---------- */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-base font-semibold text-emerald-900">Mecánica operativa del rappel</h2>
          <ol className="mt-4 space-y-3 text-sm text-emerald-800">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">1</span>
              <span>
                <strong>Durante el año:</strong> Stripe Connect retiene automáticamente el 15% en
                cada transacción. Sin cambios de código.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">2</span>
              <span>
                <strong>31 de diciembre:</strong> Se calcula la facturación acumulada por artesano
                desde el 1 de enero. Este panel muestra el importe de rappel a abonar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">3</span>
              <span>
                <strong>Enero siguiente:</strong> La S.L. emite una factura rectificativa o un
                abono directo vía transferencia al IBAN del productor (o como crédito en el próximo
                payout de Stripe Connect).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">4</span>
              <span>
                <strong>Incentivos no dinerarios (Plata y Oro):</strong> Banner en portada +
                newsletter mensual a base de datos de Madrid. La gestión es manual pero de alto
                impacto percibido para el productor.
              </span>
            </li>
          </ol>
          <p className="mt-4 rounded-2xl bg-emerald-100 p-3 text-xs text-emerald-700">
            <strong>Nota fiscal:</strong> Los rappels anuales deben documentarse mediante factura
            rectificativa (artículo 80 LIVA) emitida por el artesano a la S.L., o bien como abono
            en cuenta reflejado en el extracto mensual del vendedor. Consultar con gestoría para
            determinar el tratamiento en IRPF/IS del productor según su régimen fiscal.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
