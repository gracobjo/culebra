"use client";

import { useActionState } from "react";
import type {
  ShowroomPriceCatalogRecord,
  ShowroomPriceKindKey,
} from "@culebra/auth/showroom-pricing.service";
import {
  resetShowroomPricingAction,
  saveShowroomPricingAction,
  type ShowroomPricingActionState,
} from "@/app/admin/showroom/precios/actions";

const KIND_ORDER: ShowroomPriceKindKey[] = [
  "BASKET",
  "PACKAGING_UNIT",
  "MERCH",
  "EXPERIENCE",
];

const KIND_LABELS: Record<ShowroomPriceKindKey, string> = {
  BASKET: "Cestas (PVP + packaging)",
  PACKAGING_UNIT: "Piezas de packaging",
  MERCH: "Merchandising propio",
  EXPERIENCE: "Experiencias / catas",
};

const initial: ShowroomPricingActionState = { ok: false, message: "" };

function eurosHint(kind: ShowroomPriceKindKey) {
  if (kind === "BASKET") return "Coste = packaging · PVP = ticket cesta";
  if (kind === "PACKAGING_UNIT") return "Solo coste unitario (sin PVP)";
  if (kind === "MERCH") return "Compra propia: coste + PVP";
  return "Ticket / ingreso (catas-annual-plan alimenta el PyG en /admin/plan)";
}

export function ShowroomPricingForm({ items }: { items: ShowroomPriceCatalogRecord[] }) {
  const [state, saveAction, pending] = useActionState(saveShowroomPricingAction, initial);

  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    rows: items.filter((i) => i.kind === kind),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-6">
      <form action={saveAction} className="space-y-6">
        {grouped.map(({ kind, rows }) => (
          <section
            key={kind}
            className="overflow-x-auto rounded-3xl border border-stone-200 bg-white"
          >
            <div className="border-b border-stone-100 px-5 py-4">
              <h2 className="text-lg font-semibold">{KIND_LABELS[kind]}</h2>
              <p className="mt-1 text-xs text-stone-500">{eurosHint(kind)}</p>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Coste €</th>
                  <th className="px-4 py-3">PVP €</th>
                  <th className="px-4 py-3">Notas</th>
                  <th className="px-4 py-3">Activo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-stone-100 align-top">
                    <td className="px-4 py-3">
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        name={`label_${row.id}`}
                        defaultValue={row.label}
                        className="w-full min-w-[10rem] rounded-lg border border-stone-200 px-2 py-1.5 font-medium"
                      />
                      <p className="mt-1 font-mono text-[10px] text-stone-400">{row.key}</p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name={`costEur_${row.id}`}
                        type="number"
                        min={0}
                        step={0.01}
                        defaultValue={row.costEur ?? ""}
                        placeholder="—"
                        className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 tabular-nums"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {kind === "PACKAGING_UNIT" ? (
                        <input type="hidden" name={`pvpEur_${row.id}`} value="" />
                      ) : (
                        <input
                          name={`pvpEur_${row.id}`}
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={row.pvpEur ?? ""}
                          placeholder="—"
                          className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 tabular-nums"
                        />
                      )}
                      {kind === "PACKAGING_UNIT" ? (
                        <span className="text-xs text-stone-400">—</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name={`notes_${row.id}`}
                        defaultValue={row.notes ?? ""}
                        className="w-full min-w-[12rem] rounded-lg border border-stone-200 px-2 py-1.5 text-stone-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name={`isActive_${row.id}`}
                        defaultChecked={row.isActive}
                        className="h-4 w-4 accent-emerald-800"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="min-h-10 rounded-full bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar precios"}
          </button>
          {state.message ? (
            <p className={`text-sm ${state.ok ? "text-emerald-800" : "text-rose-700"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
      </form>

      <form action={resetShowroomPricingAction}>
        <button
          type="submit"
          className="text-sm text-stone-500 underline hover:text-stone-800"
        >
          Restaurar valores del playbook
        </button>
      </form>
    </div>
  );
}
