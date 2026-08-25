"use client";

import { useMemo, useState } from "react";
import {
  calculateStackedCommission,
  PRODUCER_TIER_COMMISSION_PERCENT,
  referenceBasketMarginTable,
  type MarginDecision,
} from "@culebra/domain";

function money(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function decisionLabel(decision: MarginDecision) {
  if (decision === "ACCEPT") return "✅ Aceptar";
  if (decision === "VOLUME_ONLY") return "⚠️ Solo volumen";
  return "❌ Evitar";
}

export function CommissionStackCalculator() {
  const [pvp, setPvp] = useState(45);
  const [producerPct, setProducerPct] = useState(17);
  const [channelPct, setChannelPct] = useState(10);
  const [packaging, setPackaging] = useState(2.4);

  const breakdown = useMemo(
    () =>
      calculateStackedCommission({
        pvp,
        producerCommissionPct: producerPct,
        channelCommissionPct: channelPct,
        packagingCost: packaging,
      }),
    [pvp, producerPct, channelPct, packaging],
  );

  const table = useMemo(
    () => referenceBasketMarginTable({ channelCommissionPct: channelPct }),
    [channelPct],
  );

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Simulador de margen (modelo en cascada)</h2>
      <p className="mt-1 text-sm text-stone-600">
        PVP → canal externo → comisión productor sobre el resto. Doc:{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">
          docs/Modelos_Comisiones_Consolidado.md
        </code>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-stone-600">
          PVP (€)
          <input
            type="number"
            min={1}
            step={0.5}
            value={pvp}
            onChange={(e) => setPvp(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>
        <label className="text-sm text-stone-600">
          Comisión productor (%)
          <select
            value={producerPct}
            onChange={(e) => setProducerPct(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          >
            {Object.entries(PRODUCER_TIER_COMMISSION_PERCENT).map(([key, pct]) => (
              <option key={key} value={pct}>
                {key} — {pct} %
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-stone-600">
          Canal externo (%)
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={channelPct}
            onChange={(e) => setChannelPct(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>
        <label className="text-sm text-stone-600">
          Packaging (€)
          <input
            type="number"
            min={0}
            step={0.1}
            value={packaging}
            onChange={(e) => setPackaging(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>
      </div>

      <dl className="mt-4 grid gap-2 rounded-2xl bg-stone-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-stone-500">Canal</dt>
          <dd className="font-medium">{money(breakdown.channelCommission)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Base productor</dt>
          <dd className="font-medium">{money(breakdown.producerBase)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Comisión S.L.</dt>
          <dd className="font-medium">{money(breakdown.marketplaceCommission)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Margen neto S.L.</dt>
          <dd className="font-semibold text-emerald-900">{money(breakdown.slNetMargin)}</dd>
        </div>
      </dl>

      <div className="mt-6 overflow-x-auto">
        <p className="mb-2 text-sm font-medium text-stone-700">
          Tabla de decisión (canal {channelPct} %)
        </p>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-stone-500">
            <tr>
              <th className="py-2 pr-4">Cesta</th>
              <th className="py-2 pr-4">Bronce</th>
              <th className="py-2 pr-4">Plata</th>
              <th className="py-2">Oro</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row.basketKey} className="border-b border-stone-100">
                <td className="py-2 pr-4 font-medium">
                  {row.basketKey} ({money(row.pvp)})
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.tierKey} className="py-2 pr-4">
                    {money(cell.breakdown.slNetMargin)}
                    <span className="ml-1 text-xs text-stone-500">
                      {decisionLabel(cell.decision)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
