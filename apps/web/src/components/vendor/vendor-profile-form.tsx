"use client";

import { useActionState } from "react";
import { submitVendorFormAction, updateVendorAction, type VendorPanelState } from "@/app/panel/proveedor/actions";
import type { VendorRecord } from "@culebra/auth";

const initialState: VendorPanelState = {};

type VendorProfileFormProps = {
  vendor: VendorRecord;
};

export function VendorProfileForm({ vendor }: VendorProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateVendorAction,
    initialState,
  );
  const editable = ["DRAFT", "REJECTED"].includes(vendor.status);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="tradeName">
            Nombre comercial
          </label>
          <input
            id="tradeName"
            name="tradeName"
            defaultValue={vendor.tradeName}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
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
              defaultValue={vendor.legalName ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="taxId">
              CIF/NIF
            </label>
            <input
              id="taxId"
              name="taxId"
              defaultValue={vendor.taxId ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="description">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={vendor.description ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="city">
              Municipio
            </label>
            <input
              id="city"
              name="city"
              defaultValue={vendor.city ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="province">
              Provincia
            </label>
            <input
              id="province"
              name="province"
              defaultValue={vendor.province ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="postalCode">
              Codigo postal
            </label>
            <input
              id="postalCode"
              name="postalCode"
              defaultValue={vendor.postalCode ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
        </div>
        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
        {editable ? (
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar perfil"}
          </button>
        ) : null}
      </form>

      {vendor.status === "DRAFT" || vendor.status === "REJECTED" ? (
        <form action={submitVendorFormAction}>
          <button
            type="submit"
            className="rounded-full border border-emerald-800 px-5 py-3 text-sm font-medium text-emerald-800"
          >
            Enviar a revision
          </button>
        </form>
      ) : null}
    </div>
  );
}
