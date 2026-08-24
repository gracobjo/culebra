"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  BASKET_COMMISSION_EXAMPLES,
  CLEAR_PITCH,
  COMPENSATION_BY_LEVEL,
  DEFAULT_COMPENSATION_SIM,
  START_PRIORITIES,
  WHAT_THEY_GET,
  runCompensationSim,
  type CompensationSimInputs,
} from "@/lib/alojamientos-contraprestaciones";

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-stone-800">{label}</span>
        <span className="tabular-nums text-emerald-900">
          {suffix === "€" ? formatPrice(value) : `${value}${suffix ? ` ${suffix}` : ""}`}
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
    </label>
  );
}

export function LodgingCompensationPlaybook() {
  const [inputs, setInputs] = useState<CompensationSimInputs>(DEFAULT_COMPENSATION_SIM);
  const result = useMemo(() => runCompensationSim(inputs), [inputs]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-200 bg-violet-50/40 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-violet-800">
          Contraprestaciones
        </p>
        <h2 className="mt-1 text-xl font-semibold text-violet-950">
          Qué perciben los alojamientos por la promoción
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-violet-950/80">
          Oferta clara, justa y fácil de entender: si es demasiado poco no se involucran; si es
          demasiado generosa os coméis el margen. Arranque 90 días: material + bienvenida a
          precio especial; comisión 10 % cuando ya fluya.
        </p>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-stone-200 bg-white">
        <h3 className="border-b border-stone-100 px-5 py-4 font-semibold">
          Por nivel de colaboración
        </h3>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3">Nivel</th>
              <th className="px-5 py-3">Qué hace</th>
              <th className="px-5 py-3">Qué percibe</th>
              <th className="px-5 py-3">Coste / prioridad</th>
            </tr>
          </thead>
          <tbody>
            {COMPENSATION_BY_LEVEL.map((row) => (
              <tr key={row.level} className="border-t border-stone-100 align-top">
                <td className="px-5 py-3 font-medium">
                  {row.level}. {row.name}
                </td>
                <td className="px-5 py-3 text-stone-600">{row.lodgingDoes}</td>
                <td className="px-5 py-3 text-stone-600">{row.receives}</td>
                <td className="px-5 py-3 text-stone-600">
                  <p>{row.ourCost}</p>
                  <p className="text-xs text-stone-500">{row.priority90}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <aside className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Simulador de coste / valor</h3>
          <SliderRow
            label="Clientes referidos"
            value={inputs.referredClients}
            min={0}
            max={80}
            step={1}
            onChange={(referredClients) => setInputs((p) => ({ ...p, referredClients }))}
          />
          <SliderRow
            label="Umbral detalle (cada N)"
            value={inputs.referralThreshold}
            min={5}
            max={15}
            step={1}
            onChange={(referralThreshold) => setInputs((p) => ({ ...p, referralThreshold }))}
          />
          <SliderRow
            label="Cestas bienvenida"
            value={inputs.welcomeBaskets}
            min={0}
            max={40}
            step={1}
            onChange={(welcomeBaskets) => setInputs((p) => ({ ...p, welcomeBaskets }))}
          />
          <SliderRow
            label="Precio especial Escapada"
            value={inputs.welcomeSpecialPrice}
            min={20}
            max={26}
            step={1}
            suffix="€"
            onChange={(welcomeSpecialPrice) => setInputs((p) => ({ ...p, welcomeSpecialPrice }))}
          />
          <SliderRow
            label="Cestas con comisión 10 %"
            value={inputs.commissionBaskets}
            min={0}
            max={30}
            step={1}
            onChange={(commissionBaskets) => setInputs((p) => ({ ...p, commissionBaskets }))}
          />
          <SliderRow
            label="PVP medio comisión"
            value={inputs.avgCommissionBasketPvp}
            min={29}
            max={65}
            step={1}
            suffix="€"
            onChange={(avgCommissionBasketPvp) =>
              setInputs((p) => ({ ...p, avgCommissionBasketPvp }))
            }
          />
          <SliderRow
            label="Coste material"
            value={inputs.materialCost}
            min={0}
            max={80}
            step={5}
            suffix="€"
            onChange={(materialCost) => setInputs((p) => ({ ...p, materialCost }))}
          />
        </aside>

        <div className="space-y-4">
          <section className="grid gap-3 rounded-3xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
            {[
              {
                label: "Detalles de agradecimiento debidos",
                value: String(result.thankYouGiftsDue),
              },
              {
                label: "Coste detalles (a PVP Escapada)",
                value: formatPrice(result.thankYouCostAtPvp),
              },
              {
                label: "Descuento cedido en bienvenida",
                value: formatPrice(result.welcomeDiscountGiven),
              },
              {
                label: "Nuestra comisión en bienvenida",
                value: formatPrice(result.ourCommissionOnWelcome),
              },
              {
                label: "Comisión pagada al alojamiento (10 %)",
                value: formatPrice(result.lodgingCommissionPaid),
              },
              {
                label: "Nuestra comisión en ventas L4",
                value: formatPrice(result.ourCommissionOnCommissionSales),
              },
              {
                label: "Valor percibido por el alojamiento",
                value: formatPrice(result.lodgingPerceivedValue),
              },
              {
                label: "Margen neto nuestro tras canal",
                value: formatPrice(result.netMarginAfterLodging),
              },
            ].map((row) => (
              <div key={row.label} className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2.5">
                <p className="text-xs text-stone-500">{row.label}</p>
                <p className="mt-0.5 font-semibold tabular-nums">{row.value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">Ejemplos comisión 10 %</h3>
            <ul className="mt-3 space-y-1 text-sm text-stone-700">
              {BASKET_COMMISSION_EXAMPLES.map((b) => (
                <li key={b.name}>
                  {b.name} ({formatPrice(b.pvp)}) → alojamiento gana{" "}
                  <strong>{formatPrice(b.lodgingEarns)}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Prioridad de arranque (90 días)</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {START_PRIORITIES.map((p) => (
              <li key={p.offer} className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
                  {p.priority}
                </p>
                <p className="font-medium text-stone-900">{p.offer}</p>
                <p className="text-stone-500">{p.why}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Mensaje claro</h3>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-800">
            {CLEAR_PITCH}
          </pre>
          <h4 className="mt-4 text-sm font-semibold">Qué van a percibir</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {WHAT_THEY_GET.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
