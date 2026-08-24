"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  COLLABORATION_LEVELS,
  CONDITIONS_SUMMARY,
  CONTACT_PITCH,
  DEFAULT_LODGING_STRATEGY,
  MATERIALS,
  PRIORITY_CRITERIA,
  PRIORITY_SUMMARY,
  SPRINT_90_PHASES,
  TRACKING_METRICS,
  VALUE_PROPS,
  runLodgingStrategy,
  type LodgingStrategyInputs,
} from "@/lib/alojamientos-estrategia";

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

const PRESETS: { id: string; label: string; patch: Partial<LodgingStrategyInputs> }[] = [
  {
    id: "start",
    label: "Arranque (día ~15)",
    patch: {
      listed: 16,
      withMaterial: 0,
      activeRecommend: 0,
      welcomePartners: 0,
      basketsVia: 0,
      referredVisits: 0,
      onlineFromGuests: 0,
    },
  },
  {
    id: "mid",
    label: "Mitad sprint",
    patch: { ...DEFAULT_LODGING_STRATEGY },
  },
  {
    id: "meta90",
    label: "Meta 90 días",
    patch: {
      listed: 18,
      withMaterial: 7,
      activeRecommend: 4,
      welcomePartners: 3,
      commissionPartners: 0,
      basketsVia: 18,
      basketsOnLodgingCommission: 0,
      referredVisits: 45,
      onlineFromGuests: 14,
      avgBasketPvp: 35,
      welcomeSpecialPrice: 23,
      welcomeSharePct: 45,
      lodgingCommissionPct: 10,
      onlineOrderTicket: 42,
      referredConversionPct: 35,
    },
  },
  {
    id: "l4",
    label: "Con comisión L4",
    patch: {
      listed: 18,
      withMaterial: 8,
      activeRecommend: 5,
      welcomePartners: 3,
      commissionPartners: 2,
      basketsVia: 28,
      basketsOnLodgingCommission: 10,
      referredVisits: 55,
      onlineFromGuests: 18,
    },
  },
];

export function AlojamientosEstrategia() {
  const [inputs, setInputs] = useState<LodgingStrategyInputs>(DEFAULT_LODGING_STRATEGY);
  const result = useMemo(() => runLodgingStrategy(inputs), [inputs]);

  function patch(partial: Partial<LodgingStrategyInputs>) {
    setInputs((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-200 bg-sky-50/50 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-sky-800">
          Canal alojamientos rurales
        </p>
        <h2 className="mt-1 text-xl font-semibold text-sky-950">
          Captación para showroom y marketplace (sin gestionar reservas)
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-sky-950/80">
          Objetivo: que casas rurales y alojamientos de la sierra deriven visitas, cestas y
          pedidos online. En los primeros 90 días: niveles {result.focusLevels}. Los niveles 4
          y 5 solo con relación de confianza.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setInputs({ ...DEFAULT_LODGING_STRATEGY, ...p.patch })}
              className="min-h-9 rounded-full border border-sky-800/30 bg-white px-3 text-xs font-medium text-sky-950 hover:bg-sky-100"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <aside className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Métricas del sprint</h3>
          <SliderRow
            label="Listado prioritario"
            value={inputs.listed}
            min={0}
            max={25}
            step={1}
            onChange={(listed) => patch({ listed })}
            hint="Meta días 1–15: 15–20"
          />
          <SliderRow
            label="Con material (N1)"
            value={inputs.withMaterial}
            min={0}
            max={20}
            step={1}
            onChange={(withMaterial) => patch({ withMaterial })}
            hint="Meta días 16–30: 6–8"
          />
          <SliderRow
            label="Recomiendan activo (N2)"
            value={inputs.activeRecommend}
            min={0}
            max={15}
            step={1}
            onChange={(activeRecommend) => patch({ activeRecommend })}
          />
          <SliderRow
            label="Cesta bienvenida (N3)"
            value={inputs.welcomePartners}
            min={0}
            max={12}
            step={1}
            onChange={(welcomePartners) => patch({ welcomePartners })}
          />
          <SliderRow
            label="Con comisión venta (N4)"
            value={inputs.commissionPartners}
            min={0}
            max={8}
            step={1}
            onChange={(commissionPartners) => patch({ commissionPartners })}
            hint="Ideal 0 en el primer sprint"
          />
          <SliderRow
            label="Cestas vía alojamientos"
            value={inputs.basketsVia}
            min={0}
            max={60}
            step={1}
            onChange={(basketsVia) => patch({ basketsVia })}
            hint="Vendidas o regaladas (acumulado 90 días)"
          />
          <SliderRow
            label="De ellas con comisión L4"
            value={inputs.basketsOnLodgingCommission}
            min={0}
            max={40}
            step={1}
            onChange={(basketsOnLodgingCommission) => patch({ basketsOnLodgingCommission })}
          />
          <SliderRow
            label="Visitas showroom por recomendación"
            value={inputs.referredVisits}
            min={0}
            max={120}
            step={1}
            onChange={(referredVisits) => patch({ referredVisits })}
          />
          <SliderRow
            label="Pedidos online de huéspedes"
            value={inputs.onlineFromGuests}
            min={0}
            max={40}
            step={1}
            onChange={(onlineFromGuests) => patch({ onlineFromGuests })}
          />
          <SliderRow
            label="Ticket medio cesta / visita"
            value={inputs.avgBasketPvp}
            min={22}
            max={65}
            step={1}
            onChange={(avgBasketPvp) => patch({ avgBasketPvp })}
            suffix="€"
          />
          <SliderRow
            label="Precio especial bienvenida"
            value={inputs.welcomeSpecialPrice}
            min={18}
            max={29}
            step={1}
            onChange={(welcomeSpecialPrice) => patch({ welcomeSpecialPrice })}
            suffix="€"
            hint="Escapada orientativa 22–24 €"
          />
          <SliderRow
            label="% cestas a precio bienvenida"
            value={inputs.welcomeSharePct}
            min={0}
            max={100}
            step={5}
            onChange={(welcomeSharePct) => patch({ welcomeSharePct })}
            suffix="%"
          />
          <SliderRow
            label="Comisión al alojamiento (L4)"
            value={inputs.lodgingCommissionPct}
            min={8}
            max={12}
            step={1}
            onChange={(lodgingCommissionPct) => patch({ lodgingCommissionPct })}
            suffix="%"
          />
          <SliderRow
            label="Conversión visita referida"
            value={inputs.referredConversionPct}
            min={15}
            max={50}
            step={1}
            onChange={(referredConversionPct) => patch({ referredConversionPct })}
            suffix="%"
          />
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">Metas a día 90</h3>
              <p className="text-sm text-stone-600">
                {result.goalsHit} / {result.goalsTotal} cumplidas
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <GoalChip
                label="Listado prioritario"
                value={String(result.goals90.listed.value)}
                target={`${result.goals90.listed.targetMin}–${result.goals90.listed.targetMax}`}
                ok={result.goals90.listed.ok}
              />
              <GoalChip
                label="Con material"
                value={String(result.goals90.withMaterial.value)}
                target={`${result.goals90.withMaterial.targetMin}–${result.goals90.withMaterial.targetMax}`}
                ok={result.goals90.withMaterial.ok}
              />
              <GoalChip
                label="Colaboraciones activas (N2+N3)"
                value={String(result.goals90.activeCollab.value)}
                target={`${result.goals90.activeCollab.targetMin}–${result.goals90.activeCollab.targetMax} estables`}
                ok={result.goals90.activeCollab.ok}
              />
              <GoalChip
                label="Cestas vía alojamientos"
                value={String(result.goals90.basketsVia.value)}
                target={`≥ ${result.goals90.basketsVia.targetMin}`}
                ok={result.goals90.basketsVia.ok}
              />
              <GoalChip
                label="Visitas por recomendación"
                value={String(result.goals90.referredVisits.value)}
                target={`≥ ${result.goals90.referredVisits.targetMin}`}
                ok={result.goals90.referredVisits.ok}
              />
              <GoalChip
                label="Pedidos online huéspedes"
                value={String(result.goals90.onlineFromGuests.value)}
                target={`≥ ${result.goals90.onlineFromGuests.targetMin}`}
                ok={result.goals90.onlineFromGuests.ok}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
            <h3 className="font-semibold">Aporte estimado del canal (sprint)</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: "Compras showroom (visitas referidas)",
                  value: `${result.referredPurchases} · ${formatPrice(result.referredGmv)}`,
                },
                {
                  label: "Margen visitas referidas",
                  value: formatPrice(result.referredShowroomMargin),
                },
                {
                  label: "GMV cestas vía alojamientos",
                  value: formatPrice(result.basketsGmv),
                },
                {
                  label: "Margen neto cestas (tras packaging y L4)",
                  value: formatPrice(result.basketsNetMargin),
                },
                {
                  label: "Comisión pagada a alojamientos",
                  value: formatPrice(result.lodgingCommissionsPaid),
                },
                {
                  label: "Comisión online huéspedes",
                  value: formatPrice(result.onlineCommission),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2.5"
                >
                  <p className="text-xs text-stone-500">{row.label}</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-stone-900">{row.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <span className="font-semibold">Margen neto del canal (estimado): </span>
              {formatPrice(result.channelNetMargin)}
              <span className="mt-1 block text-xs opacity-80">
                Suma margen visitas referidas + cestas atribuidas + comisión online de huéspedes.
                No sustituye el registro diario de visitas / origen.
              </span>
            </p>
          </section>

          <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white">
            <h3 className="border-b border-stone-100 px-5 py-4 font-semibold">
              Niveles de colaboración
            </h3>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-3">Nivel</th>
                  <th className="px-5 py-3">Ellos</th>
                  <th className="px-5 py-3">Vosotros</th>
                  <th className="px-5 py-3">90 días</th>
                </tr>
              </thead>
              <tbody>
                {COLLABORATION_LEVELS.map((row) => (
                  <tr key={row.level} className="border-t border-stone-100 align-top">
                    <td className="px-5 py-3 font-medium">
                      {row.level}. {row.name}
                      <p className="text-xs font-normal text-stone-500">{row.difficulty}</p>
                    </td>
                    <td className="px-5 py-3 text-stone-600">{row.lodgingGives}</td>
                    <td className="px-5 py-3 text-stone-600">{row.weGive}</td>
                    <td className="px-5 py-3">
                      {row.inFirst90 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
                          Prioritario
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          Más adelante
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Plan de captación 90 días</h3>
        <ol className="mt-4 space-y-3">
          {SPRINT_90_PHASES.map((phase) => (
            <li
              key={phase.id}
              className="flex flex-col gap-1 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 sm:flex-row sm:gap-4"
            >
              <span className="shrink-0 text-sm font-semibold text-sky-900">
                Días {phase.days}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-800">{phase.action}</p>
                <p className="mt-1 text-xs text-stone-500">Meta: {phase.meta}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Propuesta de valor</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {VALUE_PROPS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Material a preparar</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {MATERIALS.map((m) => (
              <li key={m.item}>
                <span className="font-medium text-stone-800">{m.item}</span>
                <span className="text-stone-500"> — {m.use}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Criterios de prioridad</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {PRIORITY_CRITERIA.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Métricas a registrar</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {TRACKING_METRICS.map((m) => (
              <li key={m.id}>{m.label}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone-500">
            Colaboraciones activas N2+N3 en simulación:{" "}
            <strong>{result.activeCollab}</strong>. Proxy colaboradores estables:{" "}
            <strong>{result.stableCollaborators}</strong>.
          </p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {CONDITIONS_SUMMARY.map((block) => (
          <section
            key={block.title}
            className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6"
          >
            <h3 className="font-semibold">{block.title}</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-stone-700">
              {block.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="font-semibold">Mensaje de primer contacto</h3>
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-800">
          {CONTACT_PITCH}
        </pre>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
        <p className="font-semibold">Prioridad del canal</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {PRIORITY_SUMMARY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
