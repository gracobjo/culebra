"use client";

import { useActionState } from "react";
import {
  startVendorStripeOnboarding,
  type StripeOnboardState,
} from "@/app/panel/proveedor/pagos/actions";

const initialState: StripeOnboardState = {};

export function StripeOnboardButton({ connected }: { connected: boolean }) {
  const [state, formAction, pending] = useActionState(
    startVendorStripeOnboarding,
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error ? <p className="mb-3 text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {pending
          ? "Redirigiendo a Stripe..."
          : connected
            ? "Completar o actualizar Stripe"
            : "Conectar cuenta Stripe"}
      </button>
    </form>
  );
}
