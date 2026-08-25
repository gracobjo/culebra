"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  BIWEEKLY_KPIS,
  DEFAULT_SHOWROOM_OPT,
  OPTIMIZATION_PRIORITIES,
  SHOWROOM_LEVERS,
  SHOWROOM_YEAR_TARGETS,
  SPRINT_90_GOALS,
  SPRINT_90_PHASES,
  SPRINT_MINIMUM_RESOURCES,
  WEEKLY_RITUALS,
  modelBalance,
  runShowroomOptimization,
  type ShowroomOptInputs,
} from "@/lib/showroom-optimization";
import { SimulatorResetButton } from "@/components/admin/simulator-reset-button";

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
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
          {suffix === "€"
            ? formatPrice(value)
            : suffix === "%"
              ? `${value} %`
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

function GoalChip({
  label,
  target,
  value,
  ok,
}: {
  label: string;
  target: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] opacity-70">Meta: {target}</p>
    </div>
  );
}

const PRESETS: { id: string; label: string; patch: Partial<ShowroomOptInputs> }[] = [
  {
    id: "base",
    label: "Base flojo",
    patch: {
      openDays: 100,
      visitsPerDay: 10,
      conversionPct: 25,
      avgTicket: 32,
      catasAnnual: 400,
      contactCapturePct: 20,
      onlineOrdersFromShowroom: 30,
      openDaysInSprint: 24,
    },
  },
  {
    id: "opt",
    label: "Optimizado Y1",
    patch: { ...DEFAULT_SHOWROOM_OPT },
  },
  {
    id: "sprint",
    label: "Meta 90 días",
    patch: {
      openDays: 130,
      visitsPerDay: 20,
      conversionPct: 36,
      avgTicket: 42,
      packagingPerSale: 2.2,
      catasAnnual: 1_500,
      contactCapturePct: 45,
      onlineOrdersFromShowroom: 100,
      onlineOrderTicket: 42,
      openDaysInSprint: 42,
      horizonDays: 90,
    },
  },
  {
    id: "y2",
    label: "Ritmo Año 2",
    patch: {
      openDays: 145,
      visitsPerDay: 21,
      conversionPct: 38,
      avgTicket: 43,
      catasAnnual: 2_000,
      contactCapturePct: 45,
      onlineOrdersFromShowroom: 140,
      openDaysInSprint: 38,
    },
  },
];

export function ShowroomOptimizer() {
  const [inputs, setInputs] = useState<ShowroomOptInputs>(DEFAULT_SHOWROOM_OPT);
  const result = useMemo(() => runShowroomOptimization(inputs), [inputs]);

  const y1Balance = modelBalance(
    result.netShowroomTotal,
    SHOWROOM_YEAR_TARGETS.optimizedY1.onlineMargin,
    SHOWROOM_YEAR_TARGETS.optimizedY1.fixedCosts,
  );
  const goalsHit = Object.values(result.goals90).filter((g) => g.ok).length;
  const goalsTotal = Object.keys(result.goals90).length;

  function patch(partial: Partial<ShowroomOptInputs>) {
    setInputs((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-emerald-800">
          Optimización showroom
        </p>
        <h2 className="mt-1 text-xl font-semibold text-emerald-950">
          Motor de margen y captación (no solo apoyo)
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-emerald-950/80">
          Con el online prudente (~3.800–4.000 € de comisión) no se cubren los fijos (~15.000 €).
          El showroom debe aportar el grueso del margen al inicio y alimentar el marketplace.
          Simula variables y contrastalo con el plan de 90 días.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setInputs({ ...DEFAULT_SHOWROOM_OPT, ...p.patch })}
              className="min-h-9 rounded-full border border-emerald-800/30 bg-white px-3 text-xs font-medium text-emerald-950 hover:bg-emerald-100"
            >
              {p.label}
            </button>
          ))}
          <SimulatorResetButton onReset={() => setInputs({ ...DEFAULT_SHOWROOM_OPT })} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <aside className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Variables</h3>
          <SliderRow
            label="Días apertura / año"
            value={inputs.openDays}
            min={60}
            max={180}
            step={5}
            onChange={(openDays) => patch({ openDays })}
            hint="Optimizado Y1: 110–120 · Y2: 140–150"
          />
          <SliderRow
            label="Visitas / día (media)"
            value={inputs.visitsPerDay}
            min={5}
            max={30}
            step={1}
            onChange={(visitsPerDay) => patch({ visitsPerDay })}
          />
          <SliderRow
            label="Conversión visita → compra"
            value={inputs.conversionPct}
            min={15}
            max={55}
            step={1}
            suffix="%"
            onChange={(conversionPct) => patch({ conversionPct })}
            hint="Meta ≥ 35 %"
          />
          <SliderRow
            label="Ticket medio"
            value={inputs.avgTicket}
            min={28}
            max={55}
            step={1}
            suffix="€"
            onChange={(avgTicket) => patch({ avgTicket })}
            hint="Meta ≥ 38–42 € (Comarca estrella)"
          />
          <SliderRow
            label="Packaging / venta"
            value={inputs.packagingPerSale}
            min={0}
            max={4.5}
            step={0.1}
            suffix="€"
            onChange={(packagingPerSale) => patch({ packagingPerSale })}
          />
          <SliderRow
            label="Catas / talleres (año)"
            value={inputs.catasAnnual}
            min={0}
            max={4_000}
            step={50}
            suffix="€"
            onChange={(catasAnnual) => patch({ catasAnnual })}
          />
          <SliderRow
            label="Captación contacto"
            value={inputs.contactCapturePct}
            min={0}
            max={80}
            step={5}
            suffix="%"
            onChange={(contactCapturePct) => patch({ contactCapturePct })}
            hint="% de compradores que dejan WhatsApp/email · meta ≥ 40 %"
          />
          <SliderRow
            label="Pedidos online desde showroom / año"
            value={inputs.onlineOrdersFromShowroom}
            min={0}
            max={200}
            step={5}
            onChange={(onlineOrdersFromShowroom) => patch({ onlineOrdersFromShowroom })}
          />
          <div className="border-t border-stone-100 pt-4">
            <p className="mb-3 text-sm font-medium">Sprint 90 días</p>
            <SliderRow
              label="Días de apertura en el sprint"
              value={inputs.openDaysInSprint}
              min={16}
              max={60}
              step={1}
              onChange={(openDaysInSprint) => patch({ openDaysInSprint })}
              hint="Fines de semana + temporada ≈ 28–36 días en 90"
            />
            <SliderRow
              label="Horizonte (días)"
              value={inputs.horizonDays}
              min={60}
              max={120}
              step={15}
              onChange={(horizonDays) => patch({ horizonDays })}
            />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "GMV showroom / año", value: formatPrice(result.gmvShowroom) },
              {
                label: "Margen neto showroom / año",
                value: formatPrice(result.netShowroomTotal),
              },
              {
                label: "Comisión online atribuida",
                value: formatPrice(result.onlineCommissionAttributed),
              },
              {
                label: "% margen showroom (vs online atrib.)",
                value: `${result.shareOfDualMargin} %`,
              },
              {
                label: "Compras / año",
                value: result.purchasesYear.toLocaleString("es-ES"),
              },
              {
                label: "Contactos captados / año",
                value: result.contactsCaptured.toLocaleString("es-ES"),
              },
              {
                label: "Resultado vs fijos Y1*",
                value: formatPrice(result.balanceY1.result),
              },
              {
                label: "Metas sprint cumplidas",
                value: `${goalsHit} / ${goalsTotal}`,
              },
            ].map((c) => (
              <div key={c.label} className="rounded-3xl border border-stone-200 bg-white p-4">
                <p className="text-xs text-stone-500">{c.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{c.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500">
            * Resultado = margen showroom simulado + comisión online atribuida − fijos{" "}
            {formatPrice(result.balanceY1.fixed)}. El online “puro” del plan (~4.000 €) se usa en
            la tabla de equilibrio de abajo.
          </p>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="font-semibold">Metas del sprint ({inputs.horizonDays} días)</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {result.openDaysInSprint} días de apertura · {result.visits90} visitas ·{" "}
                  {result.purchases90} compras · GMV {formatPrice(result.gmv90)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <GoalChip
                label="Margen neto acumulado"
                target="1.800–2.400 €"
                value={formatPrice(result.goals90.netMargin.value)}
                ok={result.goals90.netMargin.ok}
              />
              <GoalChip
                label="Ticket medio"
                target="≥ 38 €"
                value={formatPrice(result.goals90.avgTicket.value)}
                ok={result.goals90.avgTicket.ok}
              />
              <GoalChip
                label="Conversión"
                target="≥ 30–35 %"
                value={`${result.goals90.conversion.value} %`}
                ok={result.goals90.conversion.ok}
              />
              <GoalChip
                label="Cestas (proxy 55 % compras)"
                target="90–120"
                value={String(result.goals90.baskets.value)}
                ok={result.goals90.baskets.ok}
              />
              <GoalChip
                label="Contactos captados"
                target="≥ 120"
                value={String(result.goals90.contacts.value)}
                ok={result.goals90.contacts.ok}
              />
              <GoalChip
                label="Pedidos online desde showroom"
                target="≥ 25"
                value={String(result.goals90.onlineOrders.value)}
                ok={result.goals90.onlineOrders.ok}
              />
            </div>
          </section>

          <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">Equilibrio del modelo (referencia)</h3>
            <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 pr-3 font-medium">Concepto</th>
                  <th className="pb-2 pr-3 font-medium">Base flojo</th>
                  <th className="pb-2 pr-3 font-medium">Simulación actual</th>
                  <th className="pb-2 font-medium">Y2 objetivo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">Margen online</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.base.onlineMargin)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.optimizedY1.onlineMargin)}
                  </td>
                  <td className="py-2 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.optimizedY2.onlineMargin)}
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">Margen showroom + catas</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.base.showroomMargin)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums font-semibold text-emerald-900">
                    {formatPrice(result.netShowroomTotal)}
                  </td>
                  <td className="py-2 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.optimizedY2.showroomNetMargin)}
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">Total margen</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(
                      SHOWROOM_YEAR_TARGETS.base.onlineMargin +
                        SHOWROOM_YEAR_TARGETS.base.showroomMargin,
                    )}
                  </td>
                  <td className="py-2 pr-3 tabular-nums font-semibold">
                    {formatPrice(y1Balance.total)}
                  </td>
                  <td className="py-2 tabular-nums">
                    {formatPrice(
                      SHOWROOM_YEAR_TARGETS.optimizedY2.onlineMargin +
                        SHOWROOM_YEAR_TARGETS.optimizedY2.showroomNetMargin,
                    )}
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-3 font-medium">Costes fijos</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.base.fixedCosts)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.optimizedY1.fixedCosts)}
                  </td>
                  <td className="py-2 tabular-nums">
                    {formatPrice(SHOWROOM_YEAR_TARGETS.optimizedY2.fixedCosts)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Resultado</td>
                  <td className="py-2 pr-3 tabular-nums text-rose-700">
                    {formatPrice(
                      SHOWROOM_YEAR_TARGETS.base.onlineMargin +
                        SHOWROOM_YEAR_TARGETS.base.showroomMargin -
                        SHOWROOM_YEAR_TARGETS.base.fixedCosts,
                    )}
                  </td>
                  <td
                    className={`py-2 pr-3 tabular-nums font-semibold ${
                      y1Balance.result >= 0 ? "text-emerald-800" : "text-rose-700"
                    }`}
                  >
                    {formatPrice(y1Balance.result)}
                  </td>
                  <td className="py-2 tabular-nums text-emerald-800">
                    {formatPrice(
                      SHOWROOM_YEAR_TARGETS.optimizedY2.onlineMargin +
                        SHOWROOM_YEAR_TARGETS.optimizedY2.showroomNetMargin -
                        SHOWROOM_YEAR_TARGETS.optimizedY2.fixedCosts,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-stone-500">
              Showroom ~{y1Balance.showroomShare} % del margen dual en la simulación. Año 1 puede
              seguir flojo; la subvención cubre el hueco. Año 2 apunta a equilibrio operativo.
            </p>
          </section>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {SHOWROOM_LEVERS.map((lever) => (
          <div key={lever.id} className="rounded-3xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              {lever.meta}
            </p>
            <h3 className="mt-1 font-semibold">{lever.title}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-stone-700">
              {lever.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Plan 90 días</h3>
        <p className="mt-1 text-sm text-stone-500">
          Regla de oro: pocas cosas bien cada día. Prioridad: cestas visibles + degustación +
          captación + medición.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPRINT_90_GOALS.map((g) => (
            <div key={g.id} className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2 text-sm">
              <p className="font-medium">{g.label}</p>
              <p className="text-stone-600">{g.target}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {SPRINT_90_PHASES.map((phase) => (
            <details
              key={phase.id}
              className="group rounded-2xl border border-stone-200 bg-stone-50/50 open:bg-white"
              open={phase.id === "f1"}
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:content-none">
                <span className="text-emerald-800">{phase.days}</span>
                {" · "}
                {phase.title}
                <span className="mt-1 block text-sm font-normal text-stone-500">
                  {phase.focus}
                </span>
              </summary>
              <div className="border-t border-stone-100 px-4 py-4">
                <ul className="space-y-3 text-sm">
                  {phase.weeks.map((w) => (
                    <li key={w.week}>
                      <p className="font-medium text-stone-900">{w.week}</p>
                      <p className="text-stone-600">{w.actions}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Meta de fase
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-stone-700">
                  {phase.goals.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Rituales semanales</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {WEEKLY_RITUALS.map((r) => (
              <li key={r.when}>
                <span className="font-medium">{r.when}.</span>{" "}
                <span className="text-stone-600">{r.action}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">KPIs cada 15 días</h3>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-stone-700">
            {BIWEEKLY_KPIS.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Recursos mínimos</h3>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-stone-700">
            {SPRINT_MINIMUM_RESOURCES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h3 className="font-semibold text-amber-950">Prioridades (orden)</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-amber-950">
          {OPTIMIZATION_PRIORITIES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
