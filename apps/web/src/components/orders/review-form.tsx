"use client";

import { useActionState, useRef } from "react";
import { submitReview, type ReviewState } from "@/app/pedido/[orderNumber]/review-actions";

type ReviewFormProps = {
  orderNumber: string;
  productId: string;
  productName: string;
  vendorId: string;
};

const STARS = [1, 2, 3, 4, 5] as const;

const initial: ReviewState = { ok: false };

export function ReviewForm({ orderNumber, productId, productName, vendorId }: ReviewFormProps) {
  const [state, action, isPending] = useActionState(submitReview, initial);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        ¡Gracias por tu valoracion! Tu opinion ayuda a otros compradores y mejora la calidad del marketplace.
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="vendorId" value={vendorId} />

      <p className="text-sm font-medium text-stone-800">{productName}</p>

      {/* Star rating */}
      <fieldset>
        <legend className="text-sm text-stone-600">Puntuacion *</legend>
        <div className="mt-2 flex gap-1">
          {STARS.map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={star}
                required
                className="sr-only"
              />
              <span
                className="peer-checked:text-amber-400 text-2xl text-stone-300 transition-colors hover:text-amber-300 has-[:checked]:text-amber-400 [&:has(~label:hover)]:text-stone-300 hover:[&~label]:text-stone-300"
                aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
              >
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Title */}
      <div>
        <label htmlFor={`title-${productId}`} className="text-sm text-stone-600">
          Titulo (opcional)
        </label>
        <input
          id={`title-${productId}`}
          name="title"
          type="text"
          maxLength={100}
          placeholder="Resumen en pocas palabras…"
          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      </div>

      {/* Comment */}
      <div>
        <label htmlFor={`comment-${productId}`} className="text-sm text-stone-600">
          Comentario (opcional)
        </label>
        <textarea
          id={`comment-${productId}`}
          name="comment"
          maxLength={1000}
          rows={3}
          placeholder="Cuenta tu experiencia con el producto…"
          className="mt-1 w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Enviando…" : "Enviar valoracion"}
      </button>
    </form>
  );
}
