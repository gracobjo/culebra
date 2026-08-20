"use client";

import { useActionState } from "react";
import {
  createAccommodationAction,
  createAffiliateAction,
  createCouponAction,
  createPackAction,
  type TourismAdminState,
} from "./actions";

const initial: TourismAdminState = {};

export function CreateAccommodationForm({
  productOptions,
}: {
  productOptions: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(createAccommodationAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Nuevo alojamiento</h3>
      <input name="name" required placeholder="Nombre" className="min-h-11 w-full rounded-xl border px-3" />
      <input name="city" placeholder="Municipio" className="min-h-11 w-full rounded-xl border px-3" />
      <input name="bookingUrl" placeholder="URL reserva (Booking/web)" className="min-h-11 w-full rounded-xl border px-3" />
      <select name="bookingChannel" className="min-h-11 w-full rounded-xl border px-3" defaultValue="WEBSITE">
        <option value="WEBSITE">Web propia</option>
        <option value="BOOKING">Booking</option>
        <option value="WHATSAPP">WhatsApp</option>
        <option value="PHONE">Telefono</option>
        <option value="EMAIL">Email</option>
        <option value="OTHER">Otro</option>
      </select>
      <select name="status" className="min-h-11 w-full rounded-xl border px-3" defaultValue="PUBLISHED">
        <option value="DRAFT">Borrador</option>
        <option value="PUBLISHED">Publicado</option>
        <option value="DISABLED">Desactivado</option>
      </select>
      <textarea
        name="shortDescription"
        placeholder="Descripcion corta"
        rows={2}
        className="w-full rounded-xl border px-3 py-2"
      />
      <label className="block text-sm text-stone-600">
        Productos relacionados (IDs separados por coma)
        <input
          name="productIds"
          placeholder={productOptions[0]?.id ?? "productId"}
          className="mt-1 min-h-11 w-full rounded-xl border px-3"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Crear alojamiento"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}

export function CreateCouponForm() {
  const [state, action, pending] = useActionState(createCouponAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Nuevo cupon</h3>
      <input name="code" required placeholder="Codigo (SIERRA10)" className="min-h-11 w-full rounded-xl border px-3 uppercase" />
      <input name="name" required placeholder="Nombre" className="min-h-11 w-full rounded-xl border px-3" />
      <select name="discountType" className="min-h-11 w-full rounded-xl border px-3" defaultValue="PERCENTAGE">
        <option value="PERCENTAGE">Porcentaje</option>
        <option value="FIXED">Importe fijo</option>
      </select>
      <input name="discountValue" required type="number" step="0.01" placeholder="Valor" className="min-h-11 w-full rounded-xl border px-3" />
      <input name="minOrderAmount" type="number" step="0.01" placeholder="Minimo pedido (opcional)" className="min-h-11 w-full rounded-xl border px-3" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Activo
      </label>
      <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear cupon"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}

export function CreatePackForm({
  accommodations,
  coupons,
  products,
}: {
  accommodations: Array<{ id: string; name: string }>;
  coupons: Array<{ id: string; code: string }>;
  products: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(createPackAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Nuevo pack</h3>
      <input name="name" required placeholder="Nombre del pack" className="min-h-11 w-full rounded-xl border px-3" />
      <input name="nightsHint" placeholder="Ej. 2 noches (reserva externa)" className="min-h-11 w-full rounded-xl border px-3" />
      <select name="accommodationId" className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
        <option value="">Sin alojamiento</option>
        {accommodations.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <select name="productId" required className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
        <option value="" disabled>
          Producto del lote
        </option>
        {products.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input name="quantity" type="number" min={1} defaultValue={1} className="min-h-11 w-full rounded-xl border px-3" />
      <select name="couponId" className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
        <option value="">Sin cupon</option>
        {coupons.map((item) => (
          <option key={item.id} value={item.id}>
            {item.code}
          </option>
        ))}
      </select>
      <select name="status" className="min-h-11 w-full rounded-xl border px-3" defaultValue="PUBLISHED">
        <option value="DRAFT">Borrador</option>
        <option value="PUBLISHED">Publicado</option>
        <option value="DISABLED">Desactivado</option>
      </select>
      <textarea name="shortDescription" rows={2} placeholder="Descripcion" className="w-full rounded-xl border px-3 py-2" />
      <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear pack"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}

export function CreateAffiliateForm({
  accommodations,
}: {
  accommodations: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(createAffiliateAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
      <h3 className="font-medium">Codigo afiliado</h3>
      <input name="code" required placeholder="Codigo (CASAFOZ)" className="min-h-11 w-full rounded-xl border px-3 uppercase" />
      <input name="label" required placeholder="Etiqueta" className="min-h-11 w-full rounded-xl border px-3" />
      <select name="accommodationId" className="min-h-11 w-full rounded-xl border px-3" defaultValue="">
        <option value="">Sin alojamiento</option>
        {accommodations.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Activo
      </label>
      <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-emerald-800 px-5 text-sm text-white disabled:opacity-60">
        {pending ? "Guardando..." : "Crear afiliado"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
      <p className="text-xs text-stone-500">Enlace tipico: /productos?ref=CODIGO</p>
    </form>
  );
}
