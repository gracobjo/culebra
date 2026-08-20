"use client";

import { useActionState } from "react";
import { addPackToCartAction, type PackActionState } from "@/app/packs/actions";

const initialState: PackActionState = {};

export function AddPackToCartButton({ packSlug }: { packSlug: string }) {
  const [state, formAction, pending] = useActionState(addPackToCartAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="packSlug" value={packSlug} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Anadiendo..." : "Anadir lote al carrito"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
