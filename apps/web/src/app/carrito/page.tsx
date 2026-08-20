import Link from "next/link";
import {
  clearCouponAction,
  loadCart,
  removeCartItemAction,
  updateCartItemAction,
} from "./actions";
import { CartCouponForm } from "@/components/cart/cart-coupon-form";
import { formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";

export const metadata = {
  title: "Carrito | Sierra de la Culebra Marketplace",
};

export default async function CartPage() {
  const cart = await loadCart();

  return (
    <PageShell width="lg">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Carrito" }]} />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Carrito</h1>

      {cart.items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Tu carrito esta vacio"
            description="Explora productos locales de la sierra y anade lo que te interese."
            actionHref="/productos"
            actionLabel="Ver productos"
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5"
            >
              <div className="min-w-0">
                <Link href={`/productos/${item.slug}`} className="font-medium">
                  {item.productName}
                </Link>
                {item.variantLabel ? (
                  <p className="text-sm text-stone-500">{item.variantLabel}</p>
                ) : null}
                <p className="text-sm text-stone-600">{item.vendorName}</p>
                <p className="mt-1 text-sm">{formatPrice(item.unitPrice)}</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <form action={updateCartItemAction} className="flex flex-1 items-center gap-2 sm:flex-none">
                  <input type="hidden" name="itemId" value={item.id} />
                  <input
                    name="quantity"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={item.stock}
                    defaultValue={item.quantity}
                    className="min-h-11 w-24 rounded-xl border border-stone-300 px-3 py-2"
                    aria-label="Cantidad"
                  />
                  <button type="submit" className="min-h-11 text-sm text-emerald-800">
                    Actualizar
                  </button>
                </form>
                <form action={removeCartItemAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="min-h-11 text-sm text-stone-500">
                    Quitar
                  </button>
                </form>
              </div>
            </article>
          ))}

          <CartCouponForm couponCode={cart.couponCode} />

          <div className="space-y-2 rounded-3xl bg-stone-100 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {Number(cart.discountAmount) > 0 ? (
              <div className="flex items-center justify-between text-emerald-900">
                <span>Descuento{cart.couponCode ? ` (${cart.couponCode})` : ""}</span>
                <span>-{formatPrice(cart.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span>Envio</span>
              <span>{formatPrice(cart.shippingAmount)}</span>
            </div>
            <p className="text-sm text-stone-600">
              Tarifa plana de envio ({formatPrice(cart.shippingAmount || "6.50")}). El porte lo paga
              siempre el cliente.
            </p>
            <div className="flex items-center justify-between border-t border-stone-300 pt-2 font-medium">
              <span>Total</span>
              <span className="text-xl font-semibold">{formatPrice(cart.grandTotal)}</span>
            </div>
            {cart.couponCode && Number(cart.discountAmount) === 0 ? (
              <form action={clearCouponAction} className="pt-1 text-sm text-amber-800">
                El cupon no aplica al importe actual.{" "}
                <button type="submit" className="underline">
                  Quitar cupon
                </button>
              </form>
            ) : null}
          </div>

          <Link
            href="/checkout"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white sm:w-auto"
          >
            Ir a checkout
          </Link>
        </div>
      )}
    </PageShell>
  );
}
