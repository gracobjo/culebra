"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import {
  CAPITAL_REF,
  CASH_ALERT_LEVELS,
  CASH_MANAGEMENT_TIPS,
  CASH_SAFETY_FLOOR,
  COMMISSION_PRESETS,
  CONTINGENCY_GOVERNANCE,
  CONTINGENCY_SCENARIOS,
  COST_CONTAINMENT_STEPS,
  COST_SENSITIVITY_PRIORITIES,
  DEFAULT_SIMULATION,
  DEFAULT_LAUNCH_MONTH,
  DEFAULT_SUBSIDY_MONTH,
  DELAY_MANAGEMENT_TIPS,
  DEVELOPMENT_SERVICE_TOTAL,
  INVESTMENT_BREAKDOWN,
  INVESTMENT_ELIGIBLE,
  MAX_HORIZON_YEARS,
  MIN_HORIZON_YEARS,
  PARTNER_PACT_CLAUSE_SUMMARY,
  PARTNER_SUPPORT_MECHANISMS,
  PLAN_BASE_REFERENCE,
  PRESET_SCENARIOS,
  SUBSIDY_REF,
  TREASURY_RISK_MAP,
  clampCommissionRate,
  compareCommissions,
  resolveCashAlertLevel,
  runCashFlowModel,
  runSimulation,
  scaleFixedToTotal,
  sensitivityCombinedDelays,
  sensitivityCombinedScenarios,
  sensitivityFixedCosts,
  sensitivityGmvDelay,
  sensitivityMarketing,
  sensitivityReta,
  sensitivitySubsidyDelay,
  sensitivitySubsidyTiming,
  sumFixedMonthly,
  type FixedCostParts,
  type SimulationInputs,
} from "@/lib/financial-simulation";
import { SimulatorResetButton } from "@/components/admin/simulator-reset-button";

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "€",
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="tabular-nums text-emerald-900">
          {suffix === "%"
            ? `${(value * 100).toFixed(0)} %`
            : suffix === "×"
              ? `${value.toFixed(2)}×`
              : `${value.toLocaleString("es-ES")}${suffix ? ` ${suffix}` : ""}`}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-emerald-800"
      />
      {hint ? <span className="mt-1 block text-xs text-stone-500">{hint}</span> : null}
    </label>
  );
}

function euroTooltip(value: number) {
  return formatPrice(value);
}

function fmtDelta(value: number | null) {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatPrice(value)}`;
}

function SensitivityTables() {
  const fixedRows = useMemo(() => sensitivityFixedCosts(), []);
  const marketingRows = useMemo(() => sensitivityMarketing(), []);
  const retaRows = useMemo(() => sensitivityReta(), []);
  const combinedRows = useMemo(() => sensitivityCombinedScenarios(), []);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Escenario base de referencia</h3>
        <p className="mt-1 text-sm text-stone-500">
          Plan de viabilidad §5.M — valores prudente de partida. Detalle en{" "}
          <code className="rounded bg-stone-100 px-1 text-xs">docs/Sensibilidad_Costes_Plan_Viabilidad.md</code>
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Comisión", `${PLAN_BASE_REFERENCE.commissionPct} %`],
            ["Ticket medio", `${PLAN_BASE_REFERENCE.ticketEur} €`],
            ["Fijos Mes 7+", `${PLAN_BASE_REFERENCE.fixedMonthly.toLocaleString("es-ES")} €`],
            ["GMV equilibrio/mes", `≈ ${PLAN_BASE_REFERENCE.gmvBreakevenMonthly.toLocaleString("es-ES")} €`],
            ["GMV A1 / A2 / A3", "14k / 48k / 75k €"],
            ["Neto acum. 3 años", formatPrice(PLAN_BASE_REFERENCE.netAccum3y)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2">
              <dt className="text-xs text-stone-500">{k}</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Sensibilidad a costes fijos mensuales</h3>
        <p className="mt-1 text-sm text-stone-500">
          Cada +200 €/mes empeora el acumulado a 3 años en torno a 4.500–6.000 €.
        </p>
        <table className="mt-4 w-full min-w-[42rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Fijos / mes</th>
              <th className="pb-2 pr-3 font-medium">GMV equilibrio</th>
              <th className="pb-2 pr-3 font-medium">Pedidos/mes</th>
              <th className="pb-2 pr-3 font-medium">Neto A2 (sim.)</th>
              <th className="pb-2 pr-3 font-medium">Acum. 3 años (sim.)</th>
              <th className="pb-2 pr-3 font-medium">Δ vs base</th>
              <th className="pb-2 font-medium">Nota</th>
            </tr>
          </thead>
          <tbody>
            {fixedRows.map((row) => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.gmvBreakeven)}</td>
                <td className="py-2 pr-3 tabular-nums">{Math.round(row.ordersPerMonth)}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.netY2)}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.netAccum3y)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmtDelta(row.deltaAccum3yVsBase)}</td>
                <td className="py-2 text-stone-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Sensibilidad al marketing</h3>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">Marketing/mes</th>
                <th className="pb-2 pr-3 font-medium">Fijos totales</th>
                <th className="pb-2 pr-3 font-medium">Neto A2 (sim.)</th>
                <th className="pb-2 font-medium">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {marketingRows.map((row) => (
                <tr key={row.marketingMonthly} className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">{formatPrice(row.marketingMonthly)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPrice(row.fixedMonthly)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPrice(row.netY2)}</td>
                  <td className="py-2 text-stone-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Sensibilidad al RETA (Socio 2)</h3>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 pr-3 font-medium">RETA neto/mes</th>
                <th className="pb-2 pr-3 font-medium">Impacto anual</th>
                <th className="pb-2 pr-3 font-medium">Impacto acum. 3 años</th>
                <th className="pb-2 font-medium">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {retaRows.map((row) => (
                <tr key={row.retaMonthly} className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">{formatPrice(row.retaMonthly)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPrice(row.impactAnnual)}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPrice(row.impactAccum3y)}</td>
                  <td className="py-2 text-stone-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Casos combinados (presets)</h3>
        <p className="mt-1 text-sm text-stone-500">
          Pulsa un preset arriba para cargarlo en la simulación interactiva.
        </p>
        <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Escenario</th>
              <th className="pb-2 pr-3 font-medium">Fijos/mes</th>
              <th className="pb-2 pr-3 font-medium">Comisión</th>
              <th className="pb-2 pr-3 font-medium">Acum. 3 años (sim.)</th>
              <th className="pb-2 font-medium">Evaluación</th>
            </tr>
          </thead>
          <tbody>
            {combinedRows.map((row) => (
              <tr key={row.id} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.fixedMonthly)}</td>
                <td className="py-2 pr-3">{row.commissionPct} %</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.netAccum3y)}</td>
                <td className="py-2 text-stone-500">{row.evaluation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
        <h3 className="font-semibold text-emerald-950">Variables de mayor impacto</h3>
        <table className="mt-4 w-full text-left text-sm text-emerald-950">
          <thead>
            <tr className="border-b border-emerald-200/60 text-emerald-800">
              <th className="pb-2 pr-3 font-medium">#</th>
              <th className="pb-2 pr-3 font-medium">Variable</th>
              <th className="pb-2 pr-3 font-medium">Impacto</th>
              <th className="pb-2 font-medium">Control</th>
            </tr>
          </thead>
          <tbody>
            {COST_SENSITIVITY_PRIORITIES.map((row) => (
              <tr key={row.priority} className="border-b border-emerald-100/80">
                <td className="py-2 pr-3">{row.priority}</td>
                <td className="py-2 pr-3">{row.variable}</td>
                <td className="py-2 pr-3">{row.impact}</td>
                <td className="py-2">{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-emerald-900">
          <strong>Recomendación:</strong> mantener comisión <strong>17 %</strong> + fijos ≈{" "}
          <strong>1.250 €</strong>. Estructura ligera (comodato) y marketing contenido hasta tracción
          real.
        </p>
      </section>
    </div>
  );
}

function riskTone(risk: string): string {
  if (risk === "Bajo") return "text-emerald-800";
  if (risk === "Medio") return "text-amber-800";
  if (risk === "Alto") return "text-orange-800";
  if (risk === "Muy alto") return "text-rose-800";
  return "text-rose-900";
}

function DelaySensitivitySection({
  cashBase,
  launchMonth,
  onLaunchMonthChange,
}: {
  cashBase: Parameters<typeof runCashFlowModel>[0];
  launchMonth: number;
  onLaunchMonthChange: (n: number) => void;
}) {
  const base = useMemo(
    () => ({ ...cashBase, launchMonth }),
    [cashBase, launchMonth],
  );
  const subsidyDelayRows = useMemo(() => sensitivitySubsidyDelay(base), [base]);
  const combinedRows = useMemo(() => sensitivityCombinedDelays(base), [base]);
  const gmvRows = useMemo(() => sensitivityGmvDelay(base), [base]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-rose-900">Sensibilidad con retrasos</p>
        <h2 className="mt-1 text-xl font-semibold text-rose-950">
          Subvención, lanzamiento y GMV
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-rose-900/80">
          Variable crítica: momento de cobro de la subvención ({formatPrice(SUBSIDY_REF)}).
          Doc:{" "}
          <code className="rounded bg-white/70 px-1 text-xs">
            docs/Sensibilidad_Retrasos_Plan_Viabilidad.md
          </code>
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <SliderRow
          label="Mes de lanzamiento comercial (base: 6)"
          value={launchMonth}
          min={6}
          max={9}
          step={1}
          suffix=""
          onChange={onLaunchMonthChange}
          hint="Retrasar el go-live reduce ingresos en Y1 pero el opex arranca en Mes 7"
        />
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Retraso en cobro de la subvención</h3>
        <p className="mt-1 text-sm text-stone-500">
          Cada mes de retraso ≈ −1.100–1.300 € de caja mínima. Colchón peligroso desde Mes 14–15.
        </p>
        <table className="mt-4 w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Cobro</th>
              <th className="pb-2 pr-3 font-medium">Retraso</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (plan)</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (sim.)</th>
              <th className="pb-2 pr-3 font-medium">Caja A1 (sim.)</th>
              <th className="pb-2 pr-3 font-medium">Riesgo</th>
              <th className="pb-2 font-medium">Apoyo socios</th>
            </tr>
          </thead>
          <tbody>
            {subsidyDelayRows.map((row) => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3">{row.delayVsBase}</td>
                <td className="py-2 pr-3">{row.minCashApprox}</td>
                <td className="py-2 pr-3 tabular-nums font-medium">
                  {formatPrice(row.minCashComputed)}
                </td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.cashEndY1Computed)}</td>
                <td className={`py-2 pr-3 font-medium ${riskTone(row.risk)}`}>{row.risk}</td>
                <td className="py-2 text-stone-600">{row.partnerSupport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Combinado: lanzamiento + subvención</h3>
        <table className="mt-4 w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Escenario</th>
              <th className="pb-2 pr-3 font-medium">Lanzamiento</th>
              <th className="pb-2 pr-3 font-medium">Subvención</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (plan)</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (sim.)</th>
              <th className="pb-2 font-medium">Evaluación</th>
            </tr>
          </thead>
          <tbody>
            {combinedRows.map((row) => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3">Mes {row.launchMonth}</td>
                <td className="py-2 pr-3">Mes {row.subsidyMonth}</td>
                <td className="py-2 pr-3">{row.minCashApprox}</td>
                <td className="py-2 pr-3 tabular-nums font-medium">
                  {formatPrice(row.minCashComputed)}
                </td>
                <td className="py-2">{row.evaluation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Sensibilidad al GMV (subvención Mes 12)</h3>
        <table className="mt-4 w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Escenario</th>
              <th className="pb-2 pr-3 font-medium">GMV A1</th>
              <th className="pb-2 pr-3 font-medium">GMV A2</th>
              <th className="pb-2 pr-3 font-medium">Caja A2 (plan)</th>
              <th className="pb-2 pr-3 font-medium">Caja A2 (sim.)</th>
              <th className="pb-2 font-medium">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {gmvRows.map((row) => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.gmvY1)}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.gmvY2)}</td>
                <td className="py-2 pr-3">{row.cashEndY2Approx}</td>
                <td className="py-2 pr-3 tabular-nums font-medium">
                  {formatPrice(row.cashEndY2Computed)}
                </td>
                <td className="py-2 text-stone-600">{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Mapa de riesgo de tesorería</h3>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Situación</th>
              <th className="pb-2 pr-3 font-medium">Probabilidad</th>
              <th className="pb-2 pr-3 font-medium">Impacto caja</th>
              <th className="pb-2 font-medium">Prioridad mitigación</th>
            </tr>
          </thead>
          <tbody>
            {TREASURY_RISK_MAP.map((row) => (
              <tr key={row.situation} className="border-b border-stone-100">
                <td className="py-2 pr-3">{row.situation}</td>
                <td className="py-2 pr-3">{row.probability}</td>
                <td className="py-2 pr-3 font-medium">{row.cashImpact}</td>
                <td className="py-2">{row.mitigationPriority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
        <h3 className="font-semibold text-rose-950">Conclusiones y recomendaciones (retrasos)</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-rose-950">
          <li>
            El mayor riesgo no es el volumen de ventas, sino el retraso en el cobro de la
            subvención.
          </li>
          <li>
            Escenario base (Mes 12): colchón aceptable pero no holgado (≈ 8.500–9.500 €).
          </li>
          <li>Retraso 3–4 meses → zona de riesgo alto; apoyo de socios recomendable.</li>
          <li>Doble retraso (lanzamiento + cobro) puede ser crítico.</li>
        </ul>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-rose-900">
          {DELAY_MANAGEMENT_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function alertTone(id: string): string {
  if (id === "verde") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (id === "amarillo") return "border-amber-300 bg-amber-50 text-amber-950";
  if (id === "naranja") return "border-orange-300 bg-orange-50 text-orange-950";
  return "border-rose-300 bg-rose-50 text-rose-950";
}

function ContingencyPlanSection({
  minCash,
  subsidyMonth,
}: {
  minCash: number;
  subsidyMonth: number;
}) {
  const alert = resolveCashAlertLevel(minCash);
  const belowSafety = minCash < CASH_SAFETY_FLOOR;
  const subsidyDelayMonths = Math.max(0, subsidyMonth - DEFAULT_SUBSIDY_MONTH);
  const forcePartnerSupport = belowSafety || subsidyDelayMonths > 4 || alert.id === "rojo";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Plan de Contingencia de Tesorería</h2>
        <p className="mt-1 text-sm text-stone-600">
          Niveles de alerta, escenarios A/B/C y mecanismos de apoyo de socios. Doc:{" "}
          <code className="rounded bg-stone-100 px-1 text-xs">
            docs/Plan_Contingencia_Tesoreria.md
          </code>
        </p>
      </div>

      <section className={`rounded-3xl border p-5 sm:p-6 ${alertTone(alert.id)}`}>
        <h3 className="font-semibold">Nivel de alerta según caja mínima simulada</h3>
        <p className="mt-2 text-sm">
          Caja mínima del escenario actual:{" "}
          <strong className="tabular-nums">{formatPrice(minCash)}</strong>
          {" · "}
          Nivel <strong>{alert.label}</strong> ({alert.situation})
        </p>
        <p className="mt-1 text-sm">{alert.action}</p>
        <p className="mt-2 text-xs opacity-80">
          Colchón de seguridad: {formatPrice(CASH_SAFETY_FLOOR)}
          {belowSafety ? " — por debajo del mínimo." : " — por encima del mínimo."}
          {subsidyDelayMonths > 0
            ? ` Retraso subvención vs base: +${subsidyDelayMonths} mes(es).`
            : null}
          {forcePartnerSupport
            ? " Condiciones de activación de apoyo de socios cumplidas o próximas."
            : null}
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Niveles de alerta de caja</h3>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Nivel</th>
              <th className="pb-2 pr-3 font-medium">Caja disponible</th>
              <th className="pb-2 pr-3 font-medium">Situación</th>
              <th className="pb-2 pr-3 font-medium">Acción principal</th>
              <th className="pb-2 font-medium">Revisión</th>
            </tr>
          </thead>
          <tbody>
            {CASH_ALERT_LEVELS.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-stone-100 ${
                  row.id === alert.id ? "bg-stone-50 font-medium" : ""
                }`}
              >
                <td className="py-2 pr-3">{row.label}</td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.maxInclusive == null
                    ? `> ${formatPrice(row.minExclusive)}`
                    : row.id === "rojo"
                      ? `< ${formatPrice(row.maxInclusive)}`
                      : `${formatPrice(row.minExclusive)} – ${formatPrice(row.maxInclusive)}`}
                </td>
                <td className="py-2 pr-3">{row.situation}</td>
                <td className="py-2 pr-3">{row.action}</td>
                <td className="py-2">{row.reviewCadence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Escenarios de contingencia</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {CONTINGENCY_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Escenario {scenario.id}
              </p>
              <h4 className="mt-1 font-semibold text-stone-900">{scenario.title}</h4>
              <p className="mt-1 text-sm text-stone-600">{scenario.trigger}</p>
              <p className="mt-2 text-xs text-stone-500">
                Probabilidad {scenario.probability} · Impacto {scenario.impact}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-stone-700">
                {scenario.measures.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Apoyo de socios (Pacto)</h3>
        <ul className="mt-3 space-y-3 text-sm text-stone-700">
          {PARTNER_SUPPORT_MECHANISMS.map((item) => (
            <li key={item.name}>
              <span className="font-medium text-stone-900">{item.name}.</span> {item.detail}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Contención de gastos (orden)</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-700">
          {COST_CONTAINMENT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
        <h3 className="font-semibold">Gobierno y cláusula Pacto</h3>
        <p className="mt-2 text-sm text-stone-700">
          Responsable de tesorería: <strong>{CONTINGENCY_GOVERNANCE.treasurer}</strong>.
        </p>
        <p className="mt-2 text-sm text-stone-600">Información mínima a socios:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-600">
          {CONTINGENCY_GOVERNANCE.reportItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
          {PARTNER_PACT_CLAUSE_SUMMARY}
        </p>
      </section>
    </div>
  );
}

function CashFlowSection({
  inputs,
  subsidyMonth,
  onSubsidyMonthChange,
  launchMonth,
  onLaunchMonthChange,
}: {
  inputs: SimulationInputs;
  subsidyMonth: number;
  onSubsidyMonthChange: (n: number) => void;
  launchMonth: number;
  onLaunchMonthChange: (n: number) => void;
}) {
  const cashBase = useMemo(
    () => ({
      commissionRate: inputs.commissionRate,
      gmvScale: inputs.gmvScale,
      fixed: inputs.fixed,
      y1SaleMonths: inputs.y1SaleMonths,
      basketsY1: inputs.basketsY1,
      basketGrowth: inputs.basketGrowth,
      packagingPerBasket: inputs.packagingPerBasket,
      catasY1: inputs.catasY1,
      catasGrowth: inputs.catasGrowth,
      otherIncomeY1: inputs.otherIncomeY1,
      otherGrowth: inputs.otherGrowth,
      subsidyMonth,
      launchMonth,
    }),
    [inputs, subsidyMonth, launchMonth],
  );

  const cash = useMemo(() => runCashFlowModel(cashBase), [cashBase]);
  const subsidyRows = useMemo(() => sensitivitySubsidyTiming(cashBase), [cashBase]);

  const chartCash = cash.monthlyTimeline
    .filter((m) => m.month <= 18)
    .map((m) => ({
      name: `M${m.month}`,
      caja: m.balance,
      colchonMin: 8_000,
    }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-200 bg-violet-50/50 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-violet-900">Flujo de caja</p>
        <h2 className="mt-1 text-xl font-semibold text-violet-950">Tesorería real (escenario prudente)</h2>
        <p className="mt-2 max-w-3xl text-sm text-violet-900/80">
          Complementa el PyG: la caja puede ser positiva aunque el resultado contable sea negativo.
          El momento del cobro de la subvención ({formatPrice(SUBSIDY_REF)}) es la variable crítica.
          Doc: <code className="rounded bg-white/70 px-1 text-xs">docs/Flujo_Caja_Plan_Viabilidad.md</code>
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Capital social", value: formatPrice(CAPITAL_REF) },
          { label: "Inversión elegible", value: formatPrice(INVESTMENT_ELIGIBLE) },
          { label: "Caja mín. (antes subvención)", value: formatPrice(cash.minCashBeforeSubsidy) },
          { label: "Caja mín. global (sim.)", value: formatPrice(cash.minCashOverall) },
          { label: "Caja al cierre A1", value: formatPrice(cash.cashEndY1) },
          { label: "Caja al cierre A3", value: formatPrice(cash.cashEndY3) },
        ].map((c) => (
          <div key={c.label} className="rounded-3xl border border-stone-200 bg-white p-4">
            <p className="text-xs text-stone-500">{c.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Desglose inversión elegible (contrato menor)</h3>
        <p className="mt-1 text-sm text-stone-600">
          Desarrollo en dos servicios ≤ 15.000 € sin IVA cada uno (A.I + A.II ={" "}
          {formatPrice(DEVELOPMENT_SERVICE_TOTAL)}). Plan Viabilidad §3.A · memoria §25.2.
        </p>
        <table className="mt-4 w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Código</th>
              <th className="pb-2 pr-3 font-medium">Partida</th>
              <th className="pb-2 font-medium">Importe</th>
            </tr>
          </thead>
          <tbody>
            {INVESTMENT_BREAKDOWN.map((row) => (
              <tr key={row.code} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium tabular-nums">{row.code}</td>
                <td className="py-2 pr-3 text-stone-600">{row.label}</td>
                <td className="py-2 tabular-nums">{formatPrice(row.amount)}</td>
              </tr>
            ))}
            <tr>
              <td className="pt-3 pr-3 font-semibold" colSpan={2}>
                Total elegible
              </td>
              <td className="pt-3 font-semibold tabular-nums">{formatPrice(INVESTMENT_ELIGIBLE)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <SliderRow
          label="Mes de cobro de la subvención (escenario central: 12)"
          value={subsidyMonth}
          min={9}
          max={18}
          step={1}
          suffix=""
          onChange={onSubsidyMonthChange}
          hint="Arrastra para simular retrasos en la justificación ICECYL"
        />
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Año 1 — flujo mensual resumido</h3>
        <table className="mt-4 w-full min-w-[42rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Periodo</th>
              <th className="pb-2 pr-3 font-medium">Concepto</th>
              <th className="pb-2 pr-3 font-medium">Entradas</th>
              <th className="pb-2 pr-3 font-medium">Salidas</th>
              <th className="pb-2 pr-3 font-medium">Saldo mes</th>
              <th className="pb-2 font-medium">Saldo acum.</th>
            </tr>
          </thead>
          <tbody>
            {cash.y1Buckets.map((row) => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3 text-stone-600">{row.concept}</td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.inflows > 0 ? formatPrice(row.inflows) : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.outflows > 0 ? formatPrice(row.outflows) : "—"}
                </td>
                <td
                  className={`py-2 pr-3 tabular-nums ${row.netMonth >= 0 ? "text-emerald-800" : "text-rose-700"}`}
                >
                  {formatPrice(row.netMonth)}
                </td>
                <td className="py-2 tabular-nums font-medium">{formatPrice(row.balanceAccum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Años 1–3 — visión anual de caja</h3>
        <table className="mt-4 w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="pb-2 pr-3 font-medium">Año</th>
              <th className="pb-2 pr-3 font-medium">Capital</th>
              <th className="pb-2 pr-3 font-medium">Subvención</th>
              <th className="pb-2 pr-3 font-medium">Comisiones</th>
              <th className="pb-2 pr-3 font-medium">Catas + otros</th>
              <th className="pb-2 pr-3 font-medium">Cajas</th>
              <th className="pb-2 pr-3 font-medium">Inversión</th>
              <th className="pb-2 pr-3 font-medium">Opex</th>
              <th className="pb-2 pr-3 font-medium">Flujo neto</th>
              <th className="pb-2 font-medium">Caja acum.</th>
            </tr>
          </thead>
          <tbody>
            {cash.annual.map((row) => (
              <tr key={row.year} className="border-b border-stone-100">
                <td className="py-2 pr-3 font-medium">{row.year}</td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.capital > 0 ? formatPrice(row.capital) : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.subsidy > 0 ? formatPrice(row.subsidy) : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.commissionRevenue)}</td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.extraIncome > 0 ? formatPrice(row.extraIncome) : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.packaging > 0 ? `−${formatPrice(row.packaging)}` : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">
                  {row.investment > 0 ? formatPrice(row.investment) : "—"}
                </td>
                <td className="py-2 pr-3 tabular-nums">{formatPrice(row.opex)}</td>
                <td
                  className={`py-2 pr-3 tabular-nums ${row.netPeriod >= 0 ? "text-emerald-800" : "text-rose-700"}`}
                >
                  {formatPrice(row.netPeriod)}
                </td>
                <td className="py-2 tabular-nums font-medium">{formatPrice(row.cashEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Evolución de caja (Mes 0–18)</h3>
        <p className="mt-1 text-sm text-stone-500">
          Línea roja = colchón mínimo recomendado (8.000 €).
        </p>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartCash} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => euroTooltip(Number(v))} />
              <ReferenceLine
                y={8000}
                stroke="#e11d48"
                strokeDasharray="4 4"
                label={{ value: "Colchón 8k", fill: "#e11d48", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="caja"
                name="Caja acumulada"
                stroke="#6d28d9"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6">
        <h3 className="font-semibold text-amber-950">Sensibilidad: momento de cobro de la subvención</h3>
        <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-amber-200 text-amber-900">
              <th className="pb-2 pr-3 font-medium">Escenario</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (plan)</th>
              <th className="pb-2 pr-3 font-medium">Caja mín. (sim.)</th>
              <th className="pb-2 pr-3 font-medium">Riesgo</th>
              <th className="pb-2 font-medium">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {subsidyRows.map((row) => (
              <tr key={row.label} className="border-b border-amber-100">
                <td className="py-2 pr-3 font-medium">{row.label}</td>
                <td className="py-2 pr-3">{row.minCashApprox}</td>
                <td className="py-2 pr-3 tabular-nums font-medium">
                  {formatPrice(row.minCashComputed)}
                </td>
                <td className={`py-2 pr-3 font-medium ${riskTone(row.risk)}`}>{row.risk}</td>
                <td className="py-2 text-stone-600">{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
        <h3 className="font-semibold">Lectura del modelo y gestión de caja</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
          <li>
            Meses 1–9: la caja depende casi exclusivamente del capital social; la inversión consume
            ~{formatPrice(INVESTMENT_ELIGIBLE)}.
          </li>
          <li>
            El cobro de la subvención es el punto de inflexión. Caja mínima simulada con Mes{" "}
            {subsidyMonth}: <strong>{formatPrice(cash.minCashBeforeSubsidy)}</strong>.
          </li>
          <li>
            Años 2–3: pérdidas contables moderadas, pero caja positiva gracias al colchón inicial.
          </li>
          <li>El mayor riesgo de tesorería es un retraso en la ayuda, no el volumen de ventas.</li>
        </ul>
        <h4 className="mt-5 text-sm font-semibold text-stone-800">Recomendaciones</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
          {CASH_MANAGEMENT_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <DelaySensitivitySection
        cashBase={cashBase}
        launchMonth={launchMonth}
        onLaunchMonthChange={onLaunchMonthChange}
      />

      <ContingencyPlanSection
        minCash={cash.minCashOverall}
        subsidyMonth={subsidyMonth}
      />
    </div>
  );
}

export function PlanSimulator() {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_SIMULATION);
  const [subsidyMonth, setSubsidyMonth] = useState(DEFAULT_SUBSIDY_MONTH);
  const [launchMonth, setLaunchMonth] = useState(DEFAULT_LAUNCH_MONTH);
  const [customCommissionPct, setCustomCommissionPct] = useState(
    String(Math.round(DEFAULT_SIMULATION.commissionRate * 1000) / 10),
  );
  const [draftParams, setDraftParams] = useState({
    fixedMonthly: sumFixedMonthly(DEFAULT_SIMULATION.fixed),
    catasY1: DEFAULT_SIMULATION.catasY1,
    otherIncomeY1: DEFAULT_SIMULATION.otherIncomeY1,
    packagingPerBasket: DEFAULT_SIMULATION.packagingPerBasket,
    capitalRef: DEFAULT_SIMULATION.capitalRef,
    subsidyRef: DEFAULT_SIMULATION.subsidyRef,
  });

  const result = useMemo(() => runSimulation(inputs), [inputs]);
  const cmp = useMemo(() => {
    const { commissionRate: _ignored, ...base } = inputs;
    return compareCommissions(base);
  }, [inputs]);

  const isPresetCommission = COMMISSION_PRESETS.some((p) => p.value === inputs.commissionRate);

  function syncDraftFromInputs(next: SimulationInputs) {
    setDraftParams({
      fixedMonthly: sumFixedMonthly(next.fixed),
      catasY1: next.catasY1,
      otherIncomeY1: next.otherIncomeY1,
      packagingPerBasket: next.packagingPerBasket,
      capitalRef: next.capitalRef,
      subsidyRef: next.subsidyRef,
    });
    setCustomCommissionPct(String(Math.round(next.commissionRate * 1000) / 10));
  }

  function patchFixed(partial: Partial<FixedCostParts>) {
    setInputs((prev) => {
      const next = {
        ...prev,
        fixed: { ...prev.fixed, ...partial },
      };
      setDraftParams((d) => ({ ...d, fixedMonthly: sumFixedMonthly(next.fixed) }));
      return next;
    });
  }

  function applyCommissionRate(rate: number) {
    const commissionRate = clampCommissionRate(rate);
    setInputs((prev) => ({ ...prev, commissionRate }));
    setCustomCommissionPct(String(Math.round(commissionRate * 1000) / 10));
  }

  function applyCustomCommission() {
    const parsed = Number(String(customCommissionPct).replace(",", "."));
    if (!Number.isFinite(parsed)) return;
    applyCommissionRate(parsed / 100);
  }

  function applyKeyParams() {
    const fixed = scaleFixedToTotal(inputs.fixed, draftParams.fixedMonthly, {
      keepRent: inputs.fixed.rent > 0,
    });
    const next: SimulationInputs = {
      ...inputs,
      fixed,
      catasY1: Math.max(0, Math.round(draftParams.catasY1)),
      otherIncomeY1: Math.max(0, Math.round(draftParams.otherIncomeY1)),
      packagingPerBasket: Math.max(0, Number(draftParams.packagingPerBasket) || 0),
      capitalRef: Math.max(0, Math.round(draftParams.capitalRef)),
      subsidyRef: Math.max(0, Math.round(draftParams.subsidyRef)),
    };
    setInputs(next);
    syncDraftFromInputs(next);
  }

  function applyPreset(id: string) {
    const preset = PRESET_SCENARIOS.find((p) => p.id === id);
    if (!preset) return;
    const next = {
      ...inputs,
      ...preset.patch,
      fixed: preset.patch.fixed ? { ...preset.patch.fixed } : inputs.fixed,
    };
    setInputs(next);
    syncDraftFromInputs(next);
  }

  function resetSimulation() {
    const next = {
      ...DEFAULT_SIMULATION,
      fixed: { ...DEFAULT_SIMULATION.fixed },
    };
    setInputs(next);
    syncDraftFromInputs(next);
    setSubsidyMonth(DEFAULT_SUBSIDY_MONTH);
    setLaunchMonth(DEFAULT_LAUNCH_MONTH);
  }

  const chartAnnual = result.years.map((y) => ({
    name: `A${y.year}`,
    gmv: Math.round(y.gmv),
    ingresos: Math.round(y.revenue),
    neto: Math.round(y.net),
    equilibrioMes: Math.round(result.gmvBreakevenMonthly),
    gmvMensual: Math.round(y.gmv / y.months),
  }));

  let run = 0;
  const chartAccum = result.years.map((y) => {
    run += y.net;
    return { name: `A${y.year}`, acumulado: Math.round(run), neto: Math.round(y.net) };
  });

  const chartCompare = cmp.pct17.years.map((_, i) => {
    const a = cmp.pct15.years[i]!;
    const b = cmp.pct17.years[i]!;
    return {
      name: `A${a.year}`,
      "Neto 15 %": Math.round(a.net),
      "Neto 17 %": Math.round(b.net),
    };
  });

  const chartControllable = result.years.map((y) => ({
    name: `A${y.year}`,
    packaging: Math.round(y.packaging),
    catas: Math.round(y.catas),
    otros: Math.round(y.otherIncome),
  }));

  const toneClass =
    result.verdictTone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : result.verdictTone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-rose-200 bg-rose-50 text-rose-950";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-emerald-800">Simulación</p>
        <h2 className="mt-1 text-xl font-semibold">Decisiones del plan de viabilidad</h2>
        <p className="mt-2 max-w-3xl text-sm text-stone-600">
          Ajusta comisión, fijos, GMV, horizonte, coste de cajas, catas y otros ingresos a la vez.
          El PyG cubre el número de años que indiques (mínimo {MIN_HORIZON_YEARS}, máximo{" "}
          {MAX_HORIZON_YEARS}). Sirve para decidir estructura, comisión y líneas controlables antes
          de comprometer caja.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="min-h-9 rounded-full border border-stone-300 px-3 text-xs font-medium hover:border-emerald-800 hover:bg-emerald-50"
            >
              {p.label}
            </button>
          ))}
          <SimulatorResetButton onReset={resetSimulation} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <aside className="space-y-5 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Variables</h3>

          <div>
            <p className="mb-2 text-sm font-medium">Comisión base</p>
            <div className="flex flex-wrap gap-2">
              {COMMISSION_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyCommissionRate(p.value)}
                  className={`min-h-9 rounded-full border px-3 text-xs font-medium ${
                    inputs.commissionRate === p.value
                      ? "border-emerald-800 bg-emerald-800 text-white"
                      : "border-stone-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="block min-w-[8rem] flex-1 text-sm">
                <span className="font-medium text-stone-800">Otra comisión (%)</span>
                <input
                  type="number"
                  min={5}
                  max={40}
                  step={0.1}
                  value={customCommissionPct}
                  onChange={(e) => setCustomCommissionPct(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCustomCommission();
                    }
                  }}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 tabular-nums ${
                    isPresetCommission
                      ? "border-stone-300 bg-white"
                      : "border-emerald-700 bg-emerald-50"
                  }`}
                  placeholder="ej. 14.5"
                />
              </label>
              <button
                type="button"
                onClick={applyCustomCommission}
                className="min-h-10 rounded-full border border-emerald-800 bg-emerald-800 px-4 text-xs font-semibold text-white hover:bg-emerald-900"
              >
                Aplicar
              </button>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Activa: {(inputs.commissionRate * 100).toFixed(1)} % · presets al clic;
              personalizada con Aplicar (5–40 %).
            </p>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="mb-1 text-sm font-medium">Parámetros clave (cifras de resultado)</p>
            <p className="mb-3 text-xs text-stone-500">
              Edita fijos, catas, packaging, capital y ayuda; pulsa Aplicar para recalcular
              veredicto y KPIs.
            </p>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-stone-800">Fijos / mes (€)</span>
                  <span className="text-[11px] text-stone-500">
                    ahora {formatPrice(result.fixedMonthly)}
                  </span>
                </span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draftParams.fixedMonthly}
                  onChange={(e) =>
                    setDraftParams((d) => ({
                      ...d,
                      fixedMonthly: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
                <span className="mt-1 block text-xs text-stone-500">
                  Reparte el total entre cloud, gestoría, RETA, mantenimiento y marketing
                  (mantiene alquiler si está activo).
                </span>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-800">Catas / talleres año 1 (€)</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={draftParams.catasY1}
                  onChange={(e) =>
                    setDraftParams((d) => ({ ...d, catasY1: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
                <span className="mt-1 block text-xs text-stone-500">
                  «Catas + otros (horizonte)» suma catas y otros con su crecimiento anual.
                </span>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-800">Otros ingresos año 1 (€)</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={draftParams.otherIncomeY1}
                  onChange={(e) =>
                    setDraftParams((d) => ({
                      ...d,
                      otherIncomeY1: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-800">Packaging / cesta (€)</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={draftParams.packagingPerBasket}
                  onChange={(e) =>
                    setDraftParams((d) => ({
                      ...d,
                      packagingPerBasket: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-800">Capital socios (€)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={draftParams.capitalRef}
                  onChange={(e) =>
                    setDraftParams((d) => ({ ...d, capitalRef: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-800">Ayuda / subvención (€)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={draftParams.subsidyRef}
                  onChange={(e) =>
                    setDraftParams((d) => ({ ...d, subsidyRef: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 tabular-nums"
                />
              </label>
              <button
                type="button"
                onClick={applyKeyParams}
                className="w-full min-h-10 rounded-full border border-emerald-800 bg-emerald-800 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                Aplicar a la simulación
              </button>
            </div>
          </div>

          <SliderRow
            label="Ticket medio"
            value={inputs.ticketEur}
            min={45}
            max={85}
            step={1}
            onChange={(ticketEur) => setInputs((prev) => ({ ...prev, ticketEur }))}
            hint="Plan break-even usa 62 €"
          />

          <SliderRow
            label="Escala GMV (sobre base prudente)"
            value={inputs.gmvScale}
            min={0.7}
            max={1.5}
            step={0.05}
            suffix="×"
            onChange={(gmvScale) => setInputs((prev) => ({ ...prev, gmvScale }))}
            hint="1,0× = 14k / 48k / 75k / 100k / 125k; después crece con el deslizante de GMV post-Y5"
          />

          <SliderRow
            label="Años de proyección"
            value={inputs.horizonYears}
            min={MIN_HORIZON_YEARS}
            max={MAX_HORIZON_YEARS}
            step={1}
            suffix="años"
            onChange={(horizonYears) => setInputs((prev) => ({ ...prev, horizonYears }))}
            hint={`Mínimo ${MIN_HORIZON_YEARS} años. La base Excel cubre 5; el resto se proyecta.`}
          />

          <SliderRow
            label="Crecimiento GMV tras año 5"
            value={inputs.gmvGrowthAfterY5}
            min={0}
            max={0.25}
            step={0.01}
            suffix="%"
            onChange={(gmvGrowthAfterY5) => setInputs((prev) => ({ ...prev, gmvGrowthAfterY5 }))}
            hint="Solo aplica al año 6 y siguientes"
          />

          <div className="border-t border-stone-100 pt-4">
            <p className="mb-3 text-sm font-medium">Cajas, catas y otros ingresos</p>
            <div className="space-y-4">
              <SliderRow
                label="Cestas / showroom (año 1)"
                value={inputs.basketsY1}
                min={0}
                max={800}
                step={10}
                suffix=""
                onChange={(basketsY1) => setInputs((prev) => ({ ...prev, basketsY1 }))}
                hint="Modelo operativo: 380 cestas en Y1"
              />
              <SliderRow
                label="Crecimiento cestas / año"
                value={inputs.basketGrowth}
                min={0}
                max={0.8}
                step={0.05}
                suffix="%"
                onChange={(basketGrowth) => setInputs((prev) => ({ ...prev, basketGrowth }))}
              />
              <SliderRow
                label="Coste caja / packaging por cesta"
                value={inputs.packagingPerBasket}
                min={0}
                max={6}
                step={0.1}
                onChange={(packagingPerBasket) => {
                  setInputs((prev) => ({ ...prev, packagingPerBasket }));
                  setDraftParams((d) => ({ ...d, packagingPerBasket }));
                }}
                hint="Playbook: Escapada 1,80 € · Comarca 2,40 € · Sierra 3,20 €"
              />
              <SliderRow
                label="Catas / talleres (año 1)"
                value={inputs.catasY1}
                min={0}
                max={4000}
                step={50}
                onChange={(catasY1) => {
                  setInputs((prev) => ({ ...prev, catasY1 }));
                  setDraftParams((d) => ({ ...d, catasY1 }));
                }}
                hint="Opcional en el PyG base: 800 € Y1"
              />
              <SliderRow
                label="Crecimiento catas / año"
                value={inputs.catasGrowth}
                min={0}
                max={0.8}
                step={0.05}
                suffix="%"
                onChange={(catasGrowth) => setInputs((prev) => ({ ...prev, catasGrowth }))}
              />
              <SliderRow
                label="Otros ingresos (año 1)"
                value={inputs.otherIncomeY1}
                min={0}
                max={5000}
                step={50}
                onChange={(otherIncomeY1) => {
                  setInputs((prev) => ({ ...prev, otherIncomeY1 }));
                  setDraftParams((d) => ({ ...d, otherIncomeY1 }));
                }}
                hint="Mesas, merchandising, colaboraciones — 0 si no se activan"
              />
              <SliderRow
                label="Crecimiento otros / año"
                value={inputs.otherGrowth}
                min={0}
                max={0.5}
                step={0.05}
                suffix="%"
                onChange={(otherGrowth) => setInputs((prev) => ({ ...prev, otherGrowth }))}
              />
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="mb-3 text-sm font-medium">
              Costes fijos / mes{" "}
              <span className="font-normal text-stone-500">
                (total {formatPrice(sumFixedMonthly(inputs.fixed))})
              </span>
            </p>
            <div className="space-y-4">
              <SliderRow
                label="Cloud / SaaS"
                value={inputs.fixed.cloud}
                min={150}
                max={500}
                step={10}
                onChange={(cloud) => patchFixed({ cloud })}
              />
              <SliderRow
                label="Gestoría + oficina"
                value={inputs.fixed.office}
                min={150}
                max={500}
                step={10}
                onChange={(office) => patchFixed({ office })}
              />
              <SliderRow
                label="RETA Socio 2 (neto)"
                value={inputs.fixed.reta}
                min={0}
                max={400}
                step={10}
                onChange={(reta) => patchFixed({ reta })}
                hint="100 € si hay buena ayuda al autoempleo"
              />
              <SliderRow
                label="Mantenimiento técnico"
                value={inputs.fixed.maintenance}
                min={0}
                max={400}
                step={10}
                onChange={(maintenance) => patchFixed({ maintenance })}
              />
              <SliderRow
                label="Marketing"
                value={inputs.fixed.marketing}
                min={0}
                max={600}
                step={25}
                onChange={(marketing) => patchFixed({ marketing })}
                hint="Base plan ~250 €; >400 € solo con tracción"
              />
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={inputs.fixed.rent > 0}
                  onChange={(e) => patchFixed({ rent: e.target.checked ? 300 : 0 })}
                  className="h-4 w-4 accent-emerald-800"
                />
                <span>
                  Local en alquiler (+300 €/mes)
                  <span className="block text-xs text-stone-500">Base = comodato</span>
                </span>
              </label>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className={`rounded-3xl border px-4 py-3 text-sm ${toneClass}`}>
            <p className="font-medium">Veredicto</p>
            <p className="mt-1">{result.verdict}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Fijos / mes",
                value: formatPrice(result.fixedMonthly),
                hint: "Editable en Variables → Parámetros clave",
              },
              {
                label: "GMV equilibrio / mes",
                value: formatPrice(result.gmvBreakevenMonthly),
              },
              {
                label: "Pedidos / día (equilibrio)",
                value: `~${result.ordersPerDayBreakeven.toFixed(1)}`,
              },
              {
                label: "Margen / pedido",
                value: formatPrice(result.marginPerOrder),
              },
              {
                label: "Neto acum. 3 años",
                value: formatPrice(result.netAccum3y),
              },
              {
                label: "Neto acum. 5 años",
                value: formatPrice(result.netAccum5y),
              },
              {
                label: `Neto acum. ${result.years.length} años`,
                value: formatPrice(result.netAccumHorizon),
              },
              {
                label: "Packaging (horizonte)",
                value: `−${formatPrice(result.totalPackaging)}`,
                hint: "Coste caja × cestas en el horizonte",
              },
              {
                label: "Catas + otros (horizonte)",
                value: formatPrice(result.totalCatas + result.totalOtherIncome),
                hint: "Desde catas/otros año 1 + crecimiento",
              },
              {
                label: "Equilibrio desde",
                value: result.breakevenYear
                  ? `Año ${result.breakevenYear}`
                  : `Tras año ${result.years.length}`,
              },
              {
                label: "Aportación neta socios",
                value: formatPrice(result.partnerContribution),
                hint: `Capital ${formatPrice(result.capitalRef)} − ayuda ${formatPrice(result.subsidyRef)}`,
              },
            ].map((c) => (
              <div key={c.label} className="rounded-3xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{c.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{c.value}</p>
                {"hint" in c && c.hint ? (
                  <p className="mt-1 text-[11px] text-stone-500">{c.hint}</p>
                ) : null}
              </div>
            ))}
          </div>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">GMV mensual vs umbral de equilibrio</h3>
            <p className="mt-1 text-sm text-stone-500">
              Línea roja = GMV necesario al mes con tus fijos y comisión actuales.
            </p>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartAnnual} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(v) => euroTooltip(Number(v))} />
                  <Legend />
                  <ReferenceLine
                    y={result.gmvBreakevenMonthly}
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    label={{ value: "Break-even", fill: "#e11d48", fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gmvMensual"
                    name="GMV / mes"
                    stroke="#065f46"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
              <h3 className="font-semibold">Resultado neto anual</h3>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartAccum} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip formatter={(v) => euroTooltip(Number(v))} />
                    <Bar dataKey="neto" name="Neto año" fill="#047857" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
              <h3 className="font-semibold">Neto acumulado ({result.years.length} años)</h3>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartAccum} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip formatter={(v) => euroTooltip(Number(v))} />
                    <ReferenceLine y={0} stroke="#a8a29e" />
                    <Line
                      type="monotone"
                      dataKey="acumulado"
                      name="Acumulado"
                      stroke="#b45309"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="font-semibold">Comparativa cerrada 15 % vs 17 %</h3>
                <p className="mt-1 text-sm text-stone-500">
                  Mismos fijos, ticket, GMV, cajas y catas. Delta acum. 3 años a favor del 17 %:{" "}
                  <strong>{formatPrice(cmp.deltaAccum3y)}</strong>
                </p>
              </div>
            </div>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCompare} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(v) => euroTooltip(Number(v))} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#a8a29e" />
                  <Bar dataKey="Neto 15 %" fill="#a8a29e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Neto 17 %" fill="#065f46" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">Líneas controlables: cajas vs catas y otros</h3>
            <p className="mt-1 text-sm text-stone-500">
              Packaging resta margen de cestas. Catas y otros ingresos se pueden activar o cortar
              con los deslizantes.
            </p>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartControllable} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(v) => euroTooltip(Number(v))} />
                  <Legend />
                  <Bar dataKey="packaging" name="Cajas / packaging" fill="#b45309" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="catas" name="Catas" fill="#047857" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="otros" name="Otros ingresos" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">Detalle PyG simulado ({result.years.length} años)</h3>
            <table className="mt-4 w-full min-w-[52rem] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3">Año</th>
                  <th className="pb-2 pr-3">GMV</th>
                  <th className="pb-2 pr-3">Ingresos</th>
                  <th className="pb-2 pr-3">Stripe</th>
                  <th className="pb-2 pr-3">Opex</th>
                  <th className="pb-2 pr-3">Cestas</th>
                  <th className="pb-2 pr-3">Cajas</th>
                  <th className="pb-2 pr-3">Catas</th>
                  <th className="pb-2 pr-3">Otros</th>
                  <th className="pb-2 pr-3">Neto</th>
                  <th className="pb-2">Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {result.years.map((y) => (
                  <tr key={y.year} className="border-b border-stone-100">
                    <td className="py-2 pr-3 font-medium">{y.year}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatPrice(y.gmv)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatPrice(y.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatPrice(y.stripe)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatPrice(y.opex)}</td>
                    <td className="py-2 pr-3 tabular-nums">{y.baskets.toLocaleString("es-ES")}</td>
                    <td className="py-2 pr-3 tabular-nums text-amber-800">
                      −{formatPrice(y.packaging)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-emerald-800">
                      {formatPrice(y.catas)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{formatPrice(y.otherIncome)}</td>
                    <td
                      className={`py-2 pr-3 tabular-nums ${y.net < 0 ? "text-rose-700" : "text-emerald-800"}`}
                    >
                      {formatPrice(y.net)}
                    </td>
                    <td className="py-2 tabular-nums">~{y.orders.toLocaleString("es-ES")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <SensitivityTables />

      <CashFlowSection
        inputs={inputs}
        subsidyMonth={subsidyMonth}
        onSubsidyMonthChange={setSubsidyMonth}
        launchMonth={launchMonth}
        onLaunchMonthChange={setLaunchMonth}
      />
    </div>
  );
}
