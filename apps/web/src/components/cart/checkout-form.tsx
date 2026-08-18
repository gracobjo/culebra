"use client";

import { useActionState } from "react";
import { checkoutAction, type CartActionState } from "@/app/carrito/actions";
import { useState } from "react";

const initialState: CartActionState = {};

type CheckoutFormProps = {
  defaultEmail?: string;
  defaultName?: string;
};

export function CheckoutForm({ defaultEmail, defaultName }: CheckoutFormProps) {
  const [state, formAction, pending] = useActionState(checkoutAction, initialState);
  const [sameAddress, setSameAddress] = useState(true);
  const [firstName, lastName] = (defaultName ?? "").split(" ").filter(Boolean);

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Datos de contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="customerFirstName"
            required
            placeholder="Nombre"
            defaultValue={firstName}
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="customerLastName"
            required
            placeholder="Apellidos"
            defaultValue={lastName}
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <input
          name="customerEmail"
          type="email"
          required
          placeholder="Email"
          defaultValue={defaultEmail}
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <input
          name="customerPhone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Telefono"
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Direccion de envio</h2>
        <input
          name="shippingFirstName"
          required
          placeholder="Nombre"
          defaultValue={firstName}
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <input
          name="shippingLastName"
          required
          placeholder="Apellidos"
          defaultValue={lastName}
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <input
          name="shippingStreet"
          required
          placeholder="Direccion"
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            name="shippingPostalCode"
            required
            placeholder="CP"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="shippingCity"
            required
            placeholder="Municipio"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="shippingProvince"
            required
            placeholder="Provincia"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </div>
        <input
          name="shippingCompany"
          placeholder="Empresa (opcional)"
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
        <input
          name="shippingTaxId"
          placeholder="NIF/CIF (opcional)"
          className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
        />
      </section>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="billingSameAsShipping"
          value="on"
          className="h-5 w-5"
          defaultChecked
          onChange={(event) => setSameAddress(event.target.checked)}
        />
        La direccion de facturacion es la misma
      </label>

      {!sameAddress ? (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Direccion de facturacion</h2>
          <input
            name="billingFirstName"
            required
            placeholder="Nombre"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="billingLastName"
            required
            placeholder="Apellidos"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="billingStreet"
            required
            placeholder="Direccion"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              name="billingPostalCode"
              required
              placeholder="CP"
              className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
            />
            <input
              name="billingCity"
              required
              placeholder="Municipio"
              className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
            />
            <input
              name="billingProvince"
              required
              placeholder="Provincia"
              className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
            />
          </div>
          <input
            name="billingCompany"
            placeholder="Razon social (opcional)"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="billingTaxId"
            placeholder="NIF/CIF (opcional)"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
        </section>
      ) : null}

      <textarea
        name="notes"
        placeholder="Observaciones (opcional)"
        rows={3}
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />

      <p className="text-xs text-stone-500">
        [REVISAR CON ABOGADO] Al confirmar aceptas las condiciones de compra.
        El pago online se conectara en una fase posterior.
      </p>

      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Confirmando..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
