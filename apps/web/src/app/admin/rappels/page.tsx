import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import {
  euros,
  getVendorRappelSnapshots,
  RAPPEL_TIERS as BASE_TIERS,
  type VendorRappelSnapshot,
} from "@/lib/rappels";
import {
  cancelRappelSettlementAction,
  closeRappelYearAction,
  markRappelPaidAction,
} from "./actions";

export const metadata = { title: "Rappels y Captación | Admin" };

const RAPPEL_TIERS = [
  {
    ...BASE_TIERS[0],
    color: "bg-amber-100 border-amber-200 text-amber-900",
    badge: "bg-amber-200 text-amber-900",
    perks: ["Acceso estándar a la plataforma", "Estadísticas básicas de ventas"],
    target: "Microproductores y artesanos estacionales. Ideal para empezar sin riesgo.",
  },
  {
    ...BASE_TIERS[1],
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
    ...BASE_TIERS[2],
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
      "Productores digitalizados que ya venden en su canal propio. La comisión efectiva del 12% es el argumento frente a marketplaces generalistas sin cuotas ni logística FBA.",
  },
];

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
    commission: "17% todo incluido (efectivo 12–17% con rappel)",
    effective: "12–17%",
    verdict: "✓ El más competitivo",
    color: "text-emerald-700",
  },
];

function generateRappelInsight(v: VendorRappelSnapshot, year: number): string {
  const now = new Date();
  const monthsElapsed = now.getMonth() + 1;
  const monthsRemaining = 12 - monthsElapsed;
  const monthName = now.toLocaleString("es-ES", { month: "long" });
  const tierName = v.currentTier.name;
  const rev = euros(v.annualRevenue);
  const monthlyRate = monthsElapsed > 0 ? v.annualRevenue / monthsElapsed : 0;
  const projectedRevenue = monthlyRate * 12;

  if (v.currentTier.id === "gold") {
    return (
      `${v.tradeName} está en Tramo Oro con ${rev} facturados en ${year}. ` +
      `Al ritmo actual proyecta ${euros(Math.round(projectedRevenue))} anuales. ` +
      `Rappel acumulado a abonar tras el cierre: ${euros(v.pendingRebate)}. ` +
      `Considerar incrementar su visibilidad en newsletter para mantener el volumen en invierno.`
    );
  }

  if (v.nextTier && v.remainingToNextTier > 0) {
    const monthsToReach = monthlyRate > 0 ? Math.ceil(v.remainingToNextTier / monthlyRate) : null;
    const timeNote =
      monthsToReach !== null && monthsToReach <= monthsRemaining
        ? `Al ritmo de ${monthName} alcanzará el Tramo ${v.nextTier.name} en aprox. ${monthsToReach} mes${monthsToReach !== 1 ? "es" : ""}.`
        : monthsRemaining > 0
          ? `Necesita ${euros(v.remainingToNextTier)} más para saltar al Tramo ${v.nextTier.name} (${v.nextTier.effectivePct}% efectivo). ` +
            `Quedan ${monthsRemaining} meses. Activar promoción en newsletter puede acelerar el cambio de tramo.`
          : `No alcanzará el Tramo ${v.nextTier.name} este año.`;

    return (
      `${v.tradeName} lleva facturados ${rev} en ${year} — Tramo ${tierName} (${v.currentTier.effectivePct}% efectivo). ` +
      timeNote
    );
  }

  return (
    `${v.tradeName} lleva facturados ${rev} en ${year}. Tramo ${tierName} (${v.currentTier.effectivePct}% efectivo). ` +
    `Sin ventas suficientes para calcular proyección.`
  );
}

function tierBadge(tierId: string) {
  const t = RAPPEL_TIERS.find((x) => x.id === tierId);
  return t?.badge ?? "bg-stone-200 text-stone-800";
}

function FlashBanner({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const closed = typeof searchParams.closed === "string" ? searchParams.closed : null;
  const created = typeof searchParams.created === "string" ? searchParams.created : "0";
  const skipped = typeof searchParams.skipped === "string" ? searchParams.skipped : "0";
  const paid = searchParams.paid === "1";
  const cancelled = searchParams.cancelled === "1";
  const error = typeof searchParams.error === "string" ? searchParams.error : null;

  if (error) {
    const messages: Record<string, string> = {
      INVALID_YEAR: "Año no válido.",
      MISSING_SETTLEMENT: "Falta el identificador de liquidación.",
      NOT_PENDING: "La liquidación no está pendiente de abono.",
    };
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {messages[error] ?? "No se pudo completar la operación."}
      </p>
    );
  }

  if (closed) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Año {closed} cerrado: {created} liquidación(es) creada(s)
        {Number(skipped) > 0 ? ` · ${skipped} ya existían` : ""}.
      </p>
    );
  }

  if (paid) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Rappel marcado como abonado.
      </p>
    );
  }

  if (cancelled) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Liquidación de rappel cancelada.
      </p>
    );
  }

  return null;
}

export default async function AdminRappelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const [vendorStatuses, settlements] = await Promise.all([
    getVendorRappelSnapshots(currentYear),
    prisma.rappelSettlement.findMany({
      orderBy: [{ year: "desc" }, { status: "asc" }, { rebateAmount: "desc" }],
      include: { vendor: { select: { tradeName: true, city: true } } },
    }),
  ]);

  const pendingSettlements = settlements.filter((s) => s.status === "PENDING");
  const totalPendingSettled = pendingSettlements.reduce((acc, s) => acc + Number(s.rebateAmount), 0);
  const totalLiveProjection = vendorStatuses.reduce((acc, v) => acc + v.pendingRebate, 0);
  const yearsAlreadyClosed = new Set(settlements.map((s) => s.year));

  return (
    <AdminShell title="Sistema de Rappels y Estrategia de Captación">
      <div className="space-y-10">
        <FlashBanner searchParams={params} />

        {/* ---------- Liquidaciones pendientes de abono ---------- */}
        <div className="rounded-3xl border border-amber-200 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-amber-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold">Rappels pendientes de abono</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Liquidaciones congeladas al cierre del año. Plazo contractual: 60 días tras el 31 de
                diciembre (transferencia o compensación en liquidaciones).
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
              <span className="text-stone-500">Pendiente real:</span>
              <span className="ml-2 font-semibold text-amber-800">{euros(totalPendingSettled)}</span>
            </div>
          </div>

          <div className="border-b border-stone-100 px-6 py-4">
            <form action={closeRappelYearAction} className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-stone-500">Cerrar año</span>
                <select
                  name="year"
                  defaultValue={yearsAlreadyClosed.has(previousYear) ? String(currentYear) : String(previousYear)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  {[previousYear, currentYear].map((y) => (
                    <option key={y} value={y}>
                      {y}
                      {yearsAlreadyClosed.has(y) ? " (ya tiene liquidaciones)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
              >
                Cerrar año y generar pendientes
              </button>
              <p className="w-full text-xs text-stone-400">
                Solo crea filas nuevas con rappel &gt; 0. No modifica liquidaciones ya existentes.
              </p>
            </form>
          </div>

          {pendingSettlements.length === 0 ? (
            <p className="p-8 text-center text-stone-500">
              No hay rappels pendientes de abono. Cierra un año para congelar los importes.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                    {["Año", "Artesano", "Tramo", "Facturación", "Rappel", "Vence", "Abonar"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingSettlements.map((s) => (
                    <tr key={s.id} className="border-b border-stone-100 last:border-0 align-top">
                      <td className="px-4 py-3 font-medium">{s.year}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.vendor.tradeName}</p>
                        {s.vendor.city ? <p className="text-xs text-stone-400">{s.vendor.city}</p> : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tierBadge(s.tierId)}`}>
                          {s.tierName} (−{Number(s.rebatePct)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">{euros(Number(s.annualRevenue))}</td>
                      <td className="px-4 py-3 font-semibold text-amber-800">
                        {euros(Number(s.rebateAmount))}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {s.dueAt.toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <form action={markRappelPaidAction} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="settlementId" value={s.id} />
                            <select
                              name="paymentMethod"
                              className="rounded-lg border border-stone-200 px-2 py-1 text-xs"
                              defaultValue="TRANSFER"
                            >
                              <option value="TRANSFER">Transferencia</option>
                              <option value="PAYOUT_OFFSET">Compensación payout</option>
                            </select>
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800"
                            >
                              Marcar abonado
                            </button>
                          </form>
                          <form action={cancelRappelSettlementAction}>
                            <input type="hidden" name="settlementId" value={s.id} />
                            <button
                              type="submit"
                              className="text-xs text-stone-400 underline hover:text-stone-600"
                            >
                              Cancelar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {settlements.some((s) => s.status !== "PENDING") ? (
            <div className="border-t border-stone-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-stone-700">Histórico</h3>
              <ul className="mt-2 space-y-1 text-sm text-stone-500">
                {settlements
                  .filter((s) => s.status !== "PENDING")
                  .map((s) => (
                    <li key={s.id}>
                      {s.year} · {s.vendor.tradeName} · {euros(Number(s.rebateAmount))} ·{" "}
                      <span className={s.status === "PAID" ? "text-emerald-700" : "text-stone-400"}>
                        {s.status === "PAID" ? "Abonado" : "Cancelado"}
                        {s.paidAt ? ` (${s.paidAt.toLocaleDateString("es-ES")})` : ""}
                        {s.paymentMethod === "TRANSFER"
                          ? " · transferencia"
                          : s.paymentMethod === "PAYOUT_OFFSET"
                            ? " · compensación"
                            : ""}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* ---------- Tabla de tramos ---------- */}
        <div>
          <h2 className="text-base font-semibold">Plan de tramos de comisión</h2>
          <p className="mt-1 text-sm text-stone-500">
            Siempre se cobra el 17% en cada transacción (mínimo 4 € por subpedido). Al cierre del año
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
              <h2 className="text-base font-semibold">Proyección en vivo — año {currentYear}</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Estimación (aún no congelada). Sin pedidos cancelados ni devueltos.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm">
              <span className="text-stone-500">Proyección rappel:</span>
              <span className="ml-2 font-semibold text-stone-800">{euros(totalLiveProjection)}</span>
            </div>
          </div>

          {vendorStatuses.length === 0 ? (
            <p className="p-8 text-center text-stone-500">
              No hay ventas registradas aún en {currentYear}.
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
                      "Rappel proyectado",
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
                    .map((v) => {
                      const uiTier = RAPPEL_TIERS.find((t) => t.id === v.currentTier.id) ?? RAPPEL_TIERS[0];
                      return (
                        <tr key={v.vendorId} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                          <td className="px-4 py-3">
                            <p className="font-medium">{v.tradeName}</p>
                            {v.city ? <p className="text-xs text-stone-400">{v.city}</p> : null}
                          </td>
                          <td className="px-4 py-3 font-medium">{euros(v.annualRevenue)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${uiTier.badge}`}>
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
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {vendorStatuses.length > 0 && (
          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="text-base font-semibold text-violet-900">
                Informe mensual de rappels —{" "}
                {new Date().toLocaleString("es-ES", { month: "long", year: "numeric" })}
              </h2>
            </div>
            <p className="mt-1 text-sm text-violet-600">
              Análisis automático del estado de cada artesano para la toma de decisiones de captación.
            </p>
            <ul className="mt-4 space-y-3">
              {vendorStatuses
                .sort((a, b) => b.annualRevenue - a.annualRevenue)
                .map((v) => {
                  const uiTier = RAPPEL_TIERS.find((t) => t.id === v.currentTier.id) ?? RAPPEL_TIERS[0];
                  return (
                    <li key={v.vendorId} className="flex gap-3 rounded-2xl bg-white/70 p-3">
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${uiTier.badge}`}
                      >
                        {v.currentTier.name}
                      </span>
                      <p className="text-sm text-violet-900">{generateRappelInsight(v, currentYear)}</p>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        <div className="rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">Análisis de competitividad de la tarifa</h2>
          <p className="mt-1 text-sm text-stone-500">
            ¿Por qué el 17% todo incluido es el argumento más poderoso frente a la competencia?
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                  {["Canal / Competidor", "Estructura de coste", "Comisión real efectiva", "Valoración"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ),
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

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-base font-semibold text-emerald-900">Mecánica operativa del rappel</h2>
          <ol className="mt-4 space-y-3 text-sm text-emerald-800">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">
                1
              </span>
              <span>
                <strong>Durante el año:</strong> se retiene el 17% en cada transacción. La proyección
                en vivo no genera deuda contable.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">
                2
              </span>
              <span>
                <strong>Cierre:</strong> «Cerrar año» congela un{" "}
                <code className="rounded bg-emerald-100 px-1">RappelSettlement</code> por productor
                con rappel &gt; 0 (estado PENDING, vencimiento +60 días).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold">
                3
              </span>
              <span>
                <strong>Abono:</strong> transferencia al IBAN o compensación en liquidaciones;
                marcar como abonado en este panel.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </AdminShell>
  );
}
