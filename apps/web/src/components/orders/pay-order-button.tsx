"use client";

import { useActionState } from "react";
import {
  startOrderPaymentAction,
  type PaymentActionState,
} from "@/app/pedido/actions";

const initialState: PaymentActionState = {};

export function PayOrderButton({ orderNumber }: { orderNumber: string }) {
  const [state, formAction, pending] = useActionState(
    startOrderPaymentAction.bind(null, orderNumber),
    initialState,
  );

  return (
    <form action={formAction} className="mt-6">
      {state.error ? <p className="mb-3 text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Redirigiendo a Stripe..." : "Pagar ahora"}
      </button>
    </form>
  );
}
