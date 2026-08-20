"use client";

import { useActionState } from "react";
import {
  applyCouponAction,
  clearCouponAction,
  type CartActionState,
} from "@/app/carrito/actions";

const initialState: CartActionState = {};

export function CartCouponForm({
  couponCode,
}: {
  couponCode: string | null;
}) {
  const [state, formAction, pending] = useActionState(applyCouponAction, initialState);

  if (couponCode) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
        <p>
          Cupon <span className="font-medium">{couponCode}</span> aplicado
        </p>
        <form action={clearCouponAction}>
          <button type="submit" className="text-emerald-900 underline">
            Quitar
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        name="code"
        placeholder="Codigo de cupon"
        className="min-h-11 flex-1 rounded-xl border border-stone-300 px-4 py-2 uppercase"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full border border-stone-300 px-5 text-sm hover:border-emerald-800 disabled:opacity-60"
      >
        {pending ? "Aplicando..." : "Aplicar cupon"}
      </button>
      {state.error ? <p className="w-full text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="w-full text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}
