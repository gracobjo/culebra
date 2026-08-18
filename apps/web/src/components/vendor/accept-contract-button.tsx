"use client";

import { useActionState } from "react";
import {
  acceptContractAction,
  type AcceptContractState,
} from "@/app/panel/proveedor/contratos/actions";

const initialState: AcceptContractState = {};

export function AcceptContractButton({ versionId }: { versionId: string }) {
  const [state, formAction, pending] = useActionState(
    acceptContractAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="versionId" value={versionId} />
      {state.error ? <p className="mb-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? (
        <p className="mb-3 text-sm text-emerald-700">{state.success}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || Boolean(state.success)}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Registrando aceptacion..." : "Aceptar contrato"}
      </button>
    </form>
  );
}
