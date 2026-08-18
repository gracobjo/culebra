"use client";

import { useActionState } from "react";
import {
  retryPayoutsAction,
  type RetryPayoutsState,
} from "@/app/panel/proveedor/liquidaciones/actions";

const initialState: RetryPayoutsState = {};

export function RetryPayoutsButton() {
  const [state, formAction, pending] = useActionState(retryPayoutsAction, initialState);

  return (
    <form action={formAction}>
      {state.error ? <p className="mb-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? (
        <p className="mb-3 text-sm text-emerald-700">{state.success}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium disabled:opacity-60"
      >
        {pending ? "Reintentando..." : "Reintentar transferencias pendientes"}
      </button>
    </form>
  );
}
