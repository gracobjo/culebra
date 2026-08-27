"use client";

import { useActionState } from "react";
import type { ShippingSettingsRecord, SiteSocialLinksRecord } from "@culebra/auth";
import {
  upsertShippingSettingsAction,
  upsertSiteSocialLinksAction,
  type SiteConfigAdminState,
} from "./actions";

const initial: SiteConfigAdminState = {};

export function SiteSocialLinksForm({
  initialValues,
}: {
  initialValues: SiteSocialLinksRecord | null;
}) {
  const [state, action, pending] = useActionState(upsertSiteSocialLinksAction, initial);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold">Redes sociales</h2>
      <p className="text-sm text-stone-600">
        Añade los enlaces de tus plataformas más usadas. Se reflejan en la página de contacto
        y en el pie.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">Facebook</span>
          <input
            name="facebookUrl"
            defaultValue={initialValues?.facebookUrl ?? ""}
            placeholder="https://facebook.com/tu-cuenta"
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-stone-600">Instagram</span>
          <input
            name="instagramUrl"
            defaultValue={initialValues?.instagramUrl ?? ""}
            placeholder="https://instagram.com/tu-cuenta"
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-stone-600">WhatsApp</span>
          <input
            name="whatsappUrl"
            defaultValue={initialValues?.whatsappUrl ?? ""}
            placeholder="https://wa.me/34600000000 o enlace de WhatsApp"
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
      </div>
    </form>
  );
}

export function ShippingSettingsForm({
  initialValues,
}: {
  initialValues: ShippingSettingsRecord;
}) {
  const [state, action, pending] = useActionState(upsertShippingSettingsAction, initial);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-6"
    >
      <h2 className="text-lg font-semibold">Envío (tarifa plana)</h2>
      <p className="text-sm text-stone-600">
        Estos importes alimentan el carrito, el checkout y los pedidos nuevos. Los pedidos ya
        creados conservan el porte que tenían al pagar. En textos públicos se describe como
        «tarifa plana a cargo del cliente».
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-stone-600">
            Tarifa al cliente (€)
          </span>
          <input
            name="customerFeeEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={initialValues.customerFeeEur.toFixed(2)}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-stone-600">
            Coste etiqueta interno (€)
          </span>
          <input
            name="internalLabelCostEur"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            defaultValue={initialValues.internalLabelCostEur.toFixed(2)}
            className="mt-1 min-h-11 w-full rounded-xl border px-3"
          />
          <span className="mt-1 block text-xs text-stone-500">
            Referencia operativa; no se cobra aparte al cliente.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar envío"}
        </button>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
      </div>
    </form>
  );
}
