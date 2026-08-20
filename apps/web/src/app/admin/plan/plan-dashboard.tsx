"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  AVG_TICKET_EUR,
  COMMISSION_RATE,
  CONVERSION_Y1,
  EXCEL_PUBLIC_PATH,
  GMV_BREAKEVEN_MONTHLY,
  NET_ACCUM_TARGET,
  PLAN_SCENARIOS,
  accumulateNet,
  monthlyGmvProfile,
  ordersFromGmv,
  type PlanScenarioId,
} from "@/lib/financial-plan";

export type LivePlanStats = {
  gmvPaid: number;
  ordersPaid: number;
  avgTicket: number;
  estimatedCommission: number;
  vendorsActive: number;
  year: number;
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function Bar({
  value,
  max,
  tone = "emerald",
}: {
  value: number;
  max: number;
  tone?: "emerald" | "amber" | "rose" | "stone";
}) {
  const width = max > 0 ? Math.min(100, Math.max(0, (Math.abs(value) / max) * 100)) : 0;
  const colors = {
    emerald: "bg-emerald-700",
    amber: "bg-amber-600",
    rose: "bg-rose-600",
    stone: "bg-stone-400",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export function PlanDashboard({ live }: { live: LivePlanStats }) {
  const [scenarioId, setScenarioId] = useState<PlanScenarioId>("conservador");
  const [profileYear, setProfileYear] = useState(1);

  const scenario = PLAN_SCENARIOS[scenarioId];
  const accum = useMemo(() => accumulateNet(scenario.years), [scenario]);
  const maxGmv = Math.max(...scenario.years.map((y) => y.gmv));
  const y1 = scenario.years[0]!;
  const monthly = useMemo(
    () => monthlyGmvProfile(scenario.years[profileYear - 1]!.gmv, profileYear),
    [scenario, profileYear],
  );
  const maxMonthGmv = Math.max(...monthly.map((m) => m.gmv), 1);

  const y1TargetOrders = ordersFromGmv(PLAN_SCENARIOS.conservador.years[0]!.gmv);
  const progressGmv = pct(live.gmvPaid, y1.gmv);
  const progressOrders = pct(live.ordersPaid, y1TargetOrders);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-800">
              Herramienta de gestión
            </p>
            <h2 className="mt-1 text-xl font-semibold">Plan financiero 5 años</h2>
            <p className="mt-2 text-sm text-stone-600">
              Espejo operativo del Excel de cuenta de resultados y de los anexos §9.A / §9.B del
              dossier. GMV ≠ ingreso de la S.L. (ingreso = comisión {Math.round(COMMISSION_RATE * 100)}{" "}
              %).
            </p>
          </div>
          <a
            href={EXCEL_PUBLIC_PATH}
            download
            className="inline-flex min-h-10 items-center rounded-full border border-emerald-800 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
          >
            Descargar Excel (.xlsx)
          </a>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(PLAN_SCENARIOS) as PlanScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setScenarioId(id)}
              className={`min-h-10 rounded-full border px-4 py-2 text-sm ${
                scenarioId === id
                  ? "border-emerald-800 bg-emerald-800 text-white"
                  : "border-stone-300 hover:border-emerald-800"
              }`}
            >
              {PLAN_SCENARIOS[id].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-stone-500">{scenario.description}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: `GMV real ${live.year}`,
            value: formatPrice(live.gmvPaid),
            hint: `Meta Y1 (${scenario.label}): ${formatPrice(y1.gmv)} · ${progressGmv}%`,
          },
          {
            label: "Pedidos pagados",
            value: String(live.ordersPaid),
            hint: `Meta conservadora Y1: ~${y1TargetOrders} · ${progressOrders}%`,
          },
          {
            label: "Ticket medio real",
            value: live.ordersPaid > 0 ? formatPrice(live.avgTicket) : "—",
            hint: `Hipótesis plan: ${formatPrice(AVG_TICKET_EUR)}`,
          },
          {
            label: "Comisión est. 15 %",
            value: formatPrice(live.estimatedCommission),
            hint: `Vendedores activos: ${live.vendorsActive}`,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="mt-2 text-xs text-stone-500">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Proyección anual — {scenario.label}</h3>
        <p className="mt-1 text-sm text-stone-500">
          Objetivo neto acumulado 5 años ≥ {formatPrice(NET_ACCUM_TARGET)}. Proyectado:{" "}
          {formatPrice(scenario.netAccum5y)}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">Año</th>
                <th className="pb-2 pr-3 font-medium">GMV</th>
                <th className="pb-2 pr-3 font-medium">Ingresos 15 %</th>
                <th className="pb-2 pr-3 font-medium">Pedidos (~{AVG_TICKET_EUR} €)</th>
                <th className="pb-2 pr-3 font-medium">Neto</th>
                <th className="pb-2 pr-3 font-medium">Acumulado</th>
                <th className="pb-2 font-medium">GMV</th>
              </tr>
            </thead>
            <tbody>
              {scenario.years.map((row, i) => (
                <tr key={row.year} className="border-b border-stone-100">
                  <td className="py-3 pr-3 font-medium">{row.year}</td>
                  <td className="py-3 pr-3">{formatPrice(row.gmv)}</td>
                  <td className="py-3 pr-3">{formatPrice(row.revenue)}</td>
                  <td className="py-3 pr-3">~{ordersFromGmv(row.gmv).toLocaleString("es-ES")}</td>
                  <td
                    className={`py-3 pr-3 ${row.net < 0 ? "text-rose-700" : "text-emerald-800"}`}
                  >
                    {formatPrice(row.net)}
                  </td>
                  <td className="py-3 pr-3">{formatPrice(accum[i]!)}</td>
                  <td className="py-3 w-36">
                    <Bar value={row.gmv} max={maxGmv} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-stone-500">
          GMV de equilibrio orientativo (fase Y3+): ~{formatPrice(GMV_BREAKEVEN_MONTHLY)}/mes ·
          vendedores obj. Y3: {scenario.vendorsY3}.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Estacionalidad GMV</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setProfileYear(y)}
                  className={`min-h-9 rounded-full border px-3 text-xs ${
                    profileYear === y
                      ? "border-emerald-800 bg-emerald-800 text-white"
                      : "border-stone-300"
                  }`}
                >
                  Año {y}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Perfil EOTR Zamora. En Año 1 el conservador concentra venta en jul–dic.
          </p>
          <ul className="mt-4 space-y-2">
            {monthly.map((m) => (
              <li key={m.month} className="grid grid-cols-[2.5rem_1fr_5.5rem] items-center gap-2 text-sm">
                <span className="text-stone-500">{m.label}</span>
                <Bar
                  value={m.gmv}
                  max={maxMonthGmv}
                  tone={m.gmv === 0 ? "stone" : "emerald"}
                />
                <span className="text-right tabular-nums">{formatPrice(m.gmv)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold">Embudo Año 1 (§9.B)</h3>
          <p className="mt-1 text-sm text-stone-500">
            Para asegurar ~{CONVERSION_Y1.ordersTotal} pedidos / {formatPrice(CONVERSION_Y1.gmv)} GMV
            (ticket {formatPrice(CONVERSION_Y1.ticket)}).
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Pedidos / mes", `~${CONVERSION_Y1.ordersPerMonth}`],
              ["Conversión", `${CONVERSION_Y1.conversionRate * 100} %`],
              ["Sesiones / mes", `~${CONVERSION_Y1.sessionsPerMonth.toLocaleString("es-ES")}`],
              [
                "Rango sesiones",
                `${CONVERSION_Y1.sessionsRange[0].toLocaleString("es-ES")}–${CONVERSION_Y1.sessionsRange[1].toLocaleString("es-ES")}`,
              ],
              ["Ads / mes", formatPrice(CONVERSION_Y1.adsBudgetMonthly)],
              ["Ads Año 1", formatPrice(CONVERSION_Y1.adsBudgetY1)],
              ["CAC objetivo", `≤ ${formatPrice(CONVERSION_Y1.cacTarget)}`],
              ["CAC máximo", `< ${formatPrice(CONVERSION_Y1.cacMax)}`],
              ["ROAS mínimo", `≥ ${CONVERSION_Y1.roasMin}×`],
              [
                "Comisión / pedido",
                `~${formatPrice(CONVERSION_Y1.commissionPerOrder)}`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2">
                <dt className="text-xs text-stone-500">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-stone-500">
            Cortar canal si CAC &gt; margen de comisión usable o ROAS &lt; ~3–4×. Detalle en dossier
            socios §9.B.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
        <p className="font-medium text-stone-800">Gobierno del piloto</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Comparar mensualmente GMV/pedidos reales con la fila Año 1 del escenario conservador.
          </li>
          <li>
            Ticket medio &lt; 49 € de forma sostenida: riesgo de márgenes por portes absorbidos.
          </li>
          <li>
            El Excel descargable sigue siendo la hoja de trabajo contable detallada (PyG mensual);
            este panel es el cuadro de mando de gestión.
          </li>
        </ul>
      </section>
    </div>
  );
}
