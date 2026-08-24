"use client";

import { useMemo, useState } from "react";
import { PlanSimulator } from "@/components/admin/plan-simulator";
import { formatPrice } from "@/lib/format";
import {
  AVG_TICKET_EUR,
  COMMISSION_RATE,
  CONVERSION_Y1,
  EXCEL_PUBLIC_PATH,
  GMV_BREAKEVEN_MONTHLY,
  NET_ACCUM_TARGET,
  PARTNER_CONTRIBUTION,
  PLAN_SCENARIOS,
  accumulateNet,
  monthlyGmvProfile,
  ordersFromGmv,
  type PlanScenarioId,
} from "@/lib/financial-plan";
import {
  DETAILED_BASKET_Y1,
  DETAILED_BASKET_Y1_TOTAL_MARGIN,
  DETAILED_FIXED_COSTS_Y1,
  DETAILED_FIXED_MONTHLY_Y1,
  DETAILED_GMV_BREAKEVEN_ANNUAL,
  DETAILED_GMV_BREAKEVEN_MONTHLY,
  DETAILED_SENSITIVITY,
  DETAILED_SUBSIDY_74,
  DETAILED_TICKET_ONLINE,
  DETAILED_YEARS,
  detailedCashAccumulated,
} from "@/lib/financial-detailed";

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
      <PlanSimulator />

      <section className="rounded-3xl border border-emerald-200 bg-white p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-emerald-800">
          Modelo operativo 3 años
        </p>
        <h2 className="mt-1 text-xl font-semibold">Online + showroom / cestas (prudente)</h2>
        <p className="mt-2 max-w-3xl text-sm text-stone-600">
          Comisión 17 %, sin compra de stock, porte 6,50 € al cliente. Ticket online {DETAILED_TICKET_ONLINE} €.
          Fijos año 1 {formatPrice(DETAILED_FIXED_MONTHLY_Y1)}/mes. Equilibrio ≈{" "}
          {formatPrice(DETAILED_GMV_BREAKEVEN_MONTHLY)}/mes ({formatPrice(DETAILED_GMV_BREAKEVEN_ANNUAL)}/año,
          margen ~14,5 % sobre GMV). Distinto del Excel de justificación (14 / 48 / 75 k). Playbook:{" "}
          <code className="rounded bg-stone-100 px-1 text-xs">docs/Modelo_Financiero_Detallado.md</code>
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">Concepto</th>
                {DETAILED_YEARS.map((y) => (
                  <th key={y.year} className="pb-2 pr-3 font-medium">
                    Año {y.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Pedidos online / mes", DETAILED_YEARS.map((y) => String(y.onlineOrdersPerMonth))],
                  ["GMV online", DETAILED_YEARS.map((y) => formatPrice(y.gmvOnline))],
                  ["Pedidos showroom + cestas / año", DETAILED_YEARS.map((y) => String(y.showroomOrdersYear))],
                  ["GMV showroom + cestas", DETAILED_YEARS.map((y) => formatPrice(y.gmvShowroom))],
                  ["GMV total", DETAILED_YEARS.map((y) => formatPrice(y.gmvTotal))],
                  ["Comisión online", DETAILED_YEARS.map((y) => formatPrice(y.commissionOnline))],
                  ["Comisión showroom", DETAILED_YEARS.map((y) => formatPrice(y.commissionShowroom))],
                  ["Packaging cestas", DETAILED_YEARS.map((y) => `−${formatPrice(y.packaging)}`)],
                  ["Ingreso neto actividad", DETAILED_YEARS.map((y) => formatPrice(y.netActivity))],
                  ["Costes fijos", DETAILED_YEARS.map((y) => formatPrice(y.fixedAnnual))],
                  ["Resultado explotación", DETAILED_YEARS.map((y) => formatPrice(y.operatingResult))],
                  ["+ Catas (opcional)", DETAILED_YEARS.map((y) => formatPrice(y.optionalExperiences))],
                  ["Resultado c/ catas", DETAILED_YEARS.map((y) => formatPrice(y.resultWithExperiences))],
                  ["Flujo caja (sin ayudas)", DETAILED_YEARS.map((y) => formatPrice(y.cashFlow))],
                  [
                    "Caja acum. sin ayudas",
                    detailedCashAccumulated().map((v) => formatPrice(v)),
                  ],
                ] as Array<[string, string[]]>
              ).map(([label, cells]) => (
                <tr key={label} className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">{label}</td>
                  {cells.map((cell, i) => (
                    <td
                      key={`${label}-${i}`}
                      className={
                        label.includes("Resultado") || label.includes("Flujo") || label.includes("Caja acum")
                          ? "py-2 pr-3 text-rose-700"
                          : "py-2 pr-3"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Subvención 74 % sobre 30.000 € ≈ {formatPrice(DETAILED_SUBSIDY_74)} reduce el capital en riesgo.
          Equilibrio hacia finales del año 3 / inicios del 4.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <h3 className="font-medium">Fijos mensuales año 1</h3>
            <ul className="mt-3 space-y-1 text-sm text-stone-700">
              {DETAILED_FIXED_COSTS_Y1.map((row) => (
                <li key={row.item} className="flex justify-between gap-3">
                  <span>{row.item}</span>
                  <span className="tabular-nums">{formatPrice(row.amount)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-stone-200 pt-2 font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(DETAILED_FIXED_MONTHLY_Y1)}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
            <h3 className="font-medium">Cestas año 1 (margen neto S.L.)</h3>
            <ul className="mt-3 space-y-1 text-sm text-stone-700">
              {DETAILED_BASKET_Y1.map((row) => (
                <li key={row.name} className="flex justify-between gap-3">
                  <span>
                    {row.name} × {row.units}
                  </span>
                  <span className="tabular-nums">{formatPrice(row.margin)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-stone-200 pt-2 font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(DETAILED_BASKET_Y1_TOTAL_MARGIN)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">Sensibilidad</th>
                <th className="pb-2 font-medium">Impacto</th>
              </tr>
            </thead>
            <tbody>
              {DETAILED_SENSITIVITY.map((row) => (
                <tr key={row.variable} className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">{row.variable}</td>
                  <td className="py-2 text-stone-600">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-800">
              Escenarios de referencia
            </p>
            <h2 className="mt-1 text-xl font-semibold">Plan financiero 5 años (Excel / dossier)</h2>
            <p className="mt-2 text-sm text-stone-600">
              Escenarios fijos del modelo (conservador / realista / optimista). Para decidir con
              variables usa la simulación de arriba. GMV ≠ ingreso S.L. (comisión{" "}
              {Math.round(COMMISSION_RATE * 100)} %).
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
            label: `Comisión est. ${Math.round(COMMISSION_RATE * 100)} %`,
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
          Referencia neto acumulado 5 años (caso base): ~{formatPrice(NET_ACCUM_TARGET)} (aceptable
          vs aportación neta ~{formatPrice(PARTNER_CONTRIBUTION)}). Proyectado escenario:{" "}
          {formatPrice(scenario.netAccum5y)}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">Año</th>
                <th className="pb-2 pr-3 font-medium">GMV</th>
                <th className="pb-2 pr-3 font-medium">Ingresos {Math.round(COMMISSION_RATE * 100)} %</th>
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
            Hay dos lecturas: Excel conservador de justificación (GMV 14 / 48 / 75 k) y modelo
            operativo 3 años (online + showroom). No mezclarlos en informes a la administración.
          </li>
          <li>
            Ticket medio &lt; 35 € de forma sostenida: más peso del mínimo 4 €/pedido; vigilar take rate.
            Confirmar que el 100 % de pedidos cobra envío al cliente (sin portes absorbidos).
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
