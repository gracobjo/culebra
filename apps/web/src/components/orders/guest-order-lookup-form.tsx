"use client";

import { useActionState } from "react";
import {
  lookupGuestOrderAction,
  type GuestOrderLookupState,
} from "@/app/pedido/consultar/actions";

const initialState: GuestOrderLookupState = {};

export function GuestOrderLookupForm() {
  const [state, formAction, pending] = useActionState(
    lookupGuestOrderAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="orderNumber">
          Numero de pedido
        </label>
        <input
          id="orderNumber"
          name="orderNumber"
          required
          placeholder="CUL-1000"
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email del pedido
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Buscando..." : "Consultar pedido"}
      </button>
    </form>
  );
}
