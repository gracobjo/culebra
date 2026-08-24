"use client";

import { useActionState } from "react";
import {
  applyVendorAction,
  type VendorApplyState,
} from "@/app/quiero-vender/actions";

const initialState: VendorApplyState = {};

export function VendorApplyForm() {
  const [state, formAction, pending] = useActionState(
    applyVendorAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="tradeName">
          Nombre del Productor / Marca *
        </label>
        <input
          id="tradeName"
          name="tradeName"
          required
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="legalName">
            Razon social
          </label>
          <input
            id="legalName"
            name="legalName"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="taxId">
            CIF/NIF
          </label>
          <input
            id="taxId"
            name="taxId"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="description">
          Tipo de producto (Embutido, miel, reposteria, vino...)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="city">
            Municipio de La Raya / Culebra
          </label>
          <input
            id="city"
            name="city"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="province">
            Provincia
          </label>
          <input
            id="province"
            name="province"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="phone">
            Telefono de contacto
          </label>
          <input
            id="phone"
            name="phone"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email de contacto
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
      </div>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Reservando..." : "Reservar mi plaza en el grupo piloto"}
      </button>
    </form>
  );
}
