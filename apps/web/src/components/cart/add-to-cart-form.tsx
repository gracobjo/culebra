"use client";

import { useActionState } from "react";
import type { ProductRecord } from "@culebra/auth";
import { addToCartAction, type CartActionState } from "@/app/carrito/actions";

const initialState: CartActionState = {};

export function AddToCartForm({ product }: { product: ProductRecord }) {
  const [state, formAction, pending] = useActionState(addToCartAction, initialState);
  const hasVariants = product.variants.some((variant) => variant.isActive);
  const soldOut = product.stock <= 0;

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input type="hidden" name="productId" value={product.id} />
      {hasVariants ? (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="variantId">
            Formato
          </label>
          <select
            id="variantId"
            name="variantId"
            required
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          >
            {product.variants
              .filter((variant) => variant.isActive)
              .map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                  {variant.label} {variant.stock <= 0 ? "(agotado)" : ""}
                </option>
              ))}
          </select>
        </div>
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="quantity">
          Cantidad
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          max="99"
          defaultValue="1"
          className="min-h-11 w-28 rounded-xl border border-stone-300 px-4 py-3"
        />
      </div>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-emerald-700">
          {state.success}{" "}
          <a href="/carrito" className="font-medium underline">
            Ver carrito
          </a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || soldOut}
        className="min-h-12 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
      >
        {soldOut ? "Agotado" : pending ? "Anadiendo..." : "Anadir al carrito"}
      </button>
    </form>
  );
}
