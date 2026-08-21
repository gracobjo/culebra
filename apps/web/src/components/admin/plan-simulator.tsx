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
  COMMISSION_PRESETS,
  DEFAULT_SIMULATION,
  PRESET_SCENARIOS,
  compareCommissions,
  runSimulation,
  sumFixedMonthly,
  type FixedCostParts,
  type SimulationInputs,
} from "@/lib/financial-simulation";

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

export function PlanSimulator() {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_SIMULATION);

  const result = useMemo(() => runSimulation(inputs), [inputs]);
  const cmp = useMemo(
    () =>
      compareCommissions({
        ticketEur: inputs.ticketEur,
        gmvScale: inputs.gmvScale,
        fixed: inputs.fixed,
        y1SaleMonths: inputs.y1SaleMonths,
      }),
    [inputs.ticketEur, inputs.gmvScale, inputs.fixed, inputs.y1SaleMonths],
  );

  function patchFixed(partial: Partial<FixedCostParts>) {
    setInputs((prev) => ({
      ...prev,
      fixed: { ...prev.fixed, ...partial },
    }));
  }

  function applyPreset(id: string) {
    const preset = PRESET_SCENARIOS.find((p) => p.id === id);
    if (!preset) return;
    setInputs((prev) => ({
      ...prev,
      ...preset.patch,
      fixed: preset.patch.fixed ? { ...preset.patch.fixed } : prev.fixed,
    }));
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

  const chartCompare = [1, 2, 3].map((year) => {
    const a = cmp.pct15.years[year - 1]!;
    const b = cmp.pct17.years[year - 1]!;
    return {
      name: `A${year}`,
      "Neto 15 %": Math.round(a.net),
      "Neto 17 %": Math.round(b.net),
    };
  });

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
          Ajusta las variables del plan (comisión, fijos, RETA, marketing, alquiler, ticket, GMV) y
          mira el impacto en break-even, PyG a 5 años y la comparativa 15 % vs 17 %. Sirve para
          decidir antes de comprometer estructura o comisión.
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
                  onClick={() => setInputs((prev) => ({ ...prev, commissionRate: p.value }))}
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
            hint="1,0× = 14k / 48k / 75k / 100k / 125k"
          />

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
                label: "Equilibrio desde",
                value: result.breakevenYear ? `Año ${result.breakevenYear}` : "Tras Año 5",
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
              <h3 className="font-semibold">Neto acumulado 5 años</h3>
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
                  Mismos fijos, ticket y GMV que la simulación. Delta acum. 3 años a favor del 17 %:{" "}
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

          <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">Detalle PyG simulado</h3>
            <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3">Año</th>
                  <th className="pb-2 pr-3">GMV</th>
                  <th className="pb-2 pr-3">Ingresos</th>
                  <th className="pb-2 pr-3">Stripe</th>
                  <th className="pb-2 pr-3">Opex</th>
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
    </div>
  );
}
