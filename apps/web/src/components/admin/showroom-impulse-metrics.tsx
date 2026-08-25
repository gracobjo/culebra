"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  DEFAULT_IMPULSE_METRICS,
  IMPULSE_BIWEEKLY_KPIS,
  IMPULSE_METRICS_NOTE,
  IMPULSE_SKU_DEFS,
  runImpulseMetrics,
  type ImpulseMetricsInputs,
  type ImpulseSkuId,
} from "@/lib/showroom-impulse-metrics";
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
        title={hint ?? label}
        aria-label={hint ?? label}
      />
      {hint ? <span className="mt-1 block text-xs text-stone-500">{hint}</span> : null}
    </label>
  );
}

const PRESETS: { id: string; label: string; patch: Partial<ImpulseMetricsInputs> }[] = [
  {
    id: "flojo",
    label: "Sin impulso",
    patch: {
      impulseAttachPct: 15,
      avgImpulseAdd: 3,
      quickBuyPct: 10,
      avgQuickBuyTicket: 14,
      skuUnits: {
        miel: 4,
        loncheado: 3,
        mermelada: 2,
        queso: 1,
        tote: 1,
        picos: 3,
        vino: 1,
        minicata: 2,
      },
    },
  },
  {
    id: "meta",
    label: "Meta operativa",
    patch: { ...DEFAULT_IMPULSE_METRICS },
  },
  {
    id: "fuerte",
    label: "Impulso fuerte",
    patch: {
      purchases: 90,
      visits: 220,
      baseTicket: 38,
      impulseAttachPct: 55,
      avgImpulseAdd: 9,
      quickBuyPct: 30,
      avgQuickBuyTicket: 17,
      skuUnits: {
        miel: 28,
        loncheado: 24,
        mermelada: 20,
        queso: 14,
        tote: 12,
        picos: 22,
        vino: 10,
        minicata: 18,
      },
      toteStock: 40,
    },
  },
];

export function ShowroomImpulseMetrics() {
  const [inputs, setInputs] = useState<ImpulseMetricsInputs>(DEFAULT_IMPULSE_METRICS);
  const result = useMemo(() => runImpulseMetrics(inputs), [inputs]);

  function patch(partial: Partial<ImpulseMetricsInputs>) {
    setInputs((prev) => ({ ...prev, ...partial }));
  }

  function patchSku(id: ImpulseSkuId, units: number) {
    setInputs((prev) => ({
      ...prev,
      skuUnits: { ...prev.skuUnits, [id]: units },
    }));
  }

  function resetInputs() {
    setInputs({
      ...DEFAULT_IMPULSE_METRICS,
      skuUnits: { ...DEFAULT_IMPULSE_METRICS.skuUnits },
    });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Control operativo
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            Métricas — lista de 8, impulso y tote
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-stone-600">{IMPULSE_METRICS_NOTE}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              title={`Cargar preset ${p.label}`}
              data-hint={`Cargar preset ${p.label}`}
              onClick={() =>
                setInputs({
                  ...DEFAULT_IMPULSE_METRICS,
                  ...p.patch,
                  skuUnits: {
                    ...DEFAULT_IMPULSE_METRICS.skuUnits,
                    ...(p.patch.skuUnits ?? {}),
                  },
                })
              }
              className="a11y-hint min-h-9 rounded-full border border-emerald-800/30 bg-emerald-50 px-3 text-xs font-medium text-emerald-950 hover:bg-emerald-100"
            >
              {p.label}
            </button>
          ))}
          <SimulatorResetButton onReset={resetInputs} />
        </div>
      </div>

      <p className="text-sm text-stone-600">
        Metas cumplidas:{" "}
        <span className="font-semibold text-emerald-900">
          {result.goalsHit} / {result.goals.length}
        </span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {result.goals.map((g) => (
          <div
            key={g.id}
            className={`rounded-2xl border px-3 py-2 text-sm ${
              g.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="text-xs opacity-80">{g.label}</p>
            <p className="mt-0.5 font-semibold tabular-nums">{g.value}</p>
            <p className="text-[11px] opacity-70">Meta: {g.target}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <aside className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/80 p-4">
          <h3 className="font-semibold">Periodo medido</h3>
          <SliderRow
            label="Días de apertura"
            value={inputs.openDays}
            min={4}
            max={40}
            step={1}
            onChange={(openDays) => patch({ openDays })}
            hint="Quincena típica ≈ 8–14 días abiertos"
          />
          <SliderRow
            label="Visitas"
            value={inputs.visits}
            min={20}
            max={400}
            step={5}
            onChange={(visits) => patch({ visits })}
          />
          <SliderRow
            label="Compras"
            value={inputs.purchases}
            min={5}
            max={200}
            step={1}
            onChange={(purchases) => patch({ purchases })}
            hint={`Conversión actual: ${result.conversionPct} %`}
          />
          <SliderRow
            label="Ticket base (sin impulso)"
            value={inputs.baseTicket}
            min={25}
            max={50}
            step={1}
            suffix="€"
            onChange={(baseTicket) => patch({ baseTicket })}
          />
          <SliderRow
            label="% ventas con impulso"
            value={inputs.impulseAttachPct}
            min={0}
            max={90}
            step={5}
            suffix="%"
            onChange={(impulseAttachPct) => patch({ impulseAttachPct })}
            hint="Meta ≥ 40 %"
          />
          <SliderRow
            label="€ medios de impulso"
            value={inputs.avgImpulseAdd}
            min={0}
            max={15}
            step={0.5}
            suffix="€"
            onChange={(avgImpulseAdd) => patch({ avgImpulseAdd })}
            hint="Meta 4–12 €"
          />
          <SliderRow
            label="% compra rápida (sin cesta)"
            value={inputs.quickBuyPct}
            min={0}
            max={60}
            step={5}
            suffix="%"
            onChange={(quickBuyPct) => patch({ quickBuyPct })}
          />
          <SliderRow
            label="Ticket compra rápida"
            value={inputs.avgQuickBuyTicket}
            min={10}
            max={25}
            step={0.5}
            suffix="€"
            onChange={(avgQuickBuyTicket) => patch({ avgQuickBuyTicket })}
            hint="Rango objetivo 12–20 €"
          />
          <div className="border-t border-stone-200 pt-4">
            <p className="mb-3 text-sm font-medium">Tote bag</p>
            <SliderRow
              label="Stock inicial"
              value={inputs.toteStock}
              min={0}
              max={200}
              step={5}
              onChange={(toteStock) => patch({ toteStock })}
            />
            <SliderRow
              label="Coste unitario"
              value={inputs.toteUnitCost}
              min={1}
              max={8}
              step={0.25}
              suffix="€"
              onChange={(toteUnitCost) => patch({ toteUnitCost })}
            />
            <SliderRow
              label="PVP tote"
              value={inputs.totePvp}
              min={5}
              max={14}
              step={0.5}
              suffix="€"
              onChange={(totePvp) => patch({ totePvp })}
            />
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Ticket con impulso",
                value: formatPrice(result.ticketWithImpulse),
              },
              { label: "Subida media ticket", value: formatPrice(result.ticketUplift) },
              {
                label: "GMV impulso (añadidos)",
                value: formatPrice(result.impulseGmv),
              },
              {
                label: "Margen lista de 8",
                value: formatPrice(result.skuMargin),
              },
              {
                label: "Compras rápidas",
                value: `${result.quickBuyCount} · ${formatPrice(result.quickBuyGmv)}`,
              },
              {
                label: "Tipo cesta / lote",
                value: String(result.basketLikeCount),
              },
              {
                label: "Margen tote",
                value: `${formatPrice(result.toteMargin)} · quedan ${result.toteStockLeft}`,
              },
              {
                label: "Mini-cata",
                value: `${result.miniCataCount} · ${formatPrice(result.miniCataMargin)}`,
              },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-stone-200 bg-stone-50/50 p-3">
                <p className="text-xs text-stone-500">{c.label}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">{c.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold">Unidades vendidas — lista de 8</h3>
            <p className="mt-1 text-xs text-stone-500">
              Ajusta lo vendido en el periodo. Comisión 17 % salvo tote y mini-cata (margen propio).
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {IMPULSE_SKU_DEFS.map((sku) => {
                const row = result.skuRows.find((r) => r.id === sku.id)!;
                return (
                  <div key={sku.id} className="rounded-2xl border border-stone-100 p-3">
                    <SliderRow
                      label={`${sku.order}. ${sku.name}`}
                      value={inputs.skuUnits[sku.id]}
                      min={0}
                      max={sku.id === "tote" || sku.id === "minicata" ? 80 : 60}
                      step={1}
                      onChange={(n) => patchSku(sku.id, n)}
                      hint={`${sku.target} · PVP ~${formatPrice(sku.id === "tote" ? inputs.totePvp : sku.avgPvp)} · margen ${formatPrice(row.margin)}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-2">Artículo</th>
                  <th className="px-4 py-2">Uds</th>
                  <th className="px-4 py-2">GMV</th>
                  <th className="px-4 py-2">Margen</th>
                  <th className="px-4 py-2">Modelo</th>
                </tr>
              </thead>
              <tbody>
                {result.skuRows.map((row) => (
                  <tr key={row.id} className="border-t border-stone-100">
                    <td className="px-4 py-2 font-medium">
                      {row.order}. {row.name}
                    </td>
                    <td className="px-4 py-2 tabular-nums">{row.units}</td>
                    <td className="px-4 py-2 tabular-nums">{formatPrice(row.gmv)}</td>
                    <td className="px-4 py-2 tabular-nums font-medium">
                      {formatPrice(row.margin)}
                    </td>
                    <td className="px-4 py-2 text-stone-600">
                      {row.ownMargin ? "Margen propio" : "Comisión 17 %"}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-stone-200 bg-stone-50 font-medium">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 tabular-nums">
                    {result.skuRows.reduce((s, r) => s + r.units, 0)}
                  </td>
                  <td className="px-4 py-2 tabular-nums">{formatPrice(result.skuGmv)}</td>
                  <td className="px-4 py-2 tabular-nums">{formatPrice(result.skuMargin)}</td>
                  <td className="px-4 py-2" />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4">
            <h3 className="text-sm font-semibold">KPIs a anotar cada 15 días</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
              {IMPULSE_BIWEEKLY_KPIS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
