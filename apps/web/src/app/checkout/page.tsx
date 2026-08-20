import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadCart } from "../carrito/actions";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { formatPrice } from "@/lib/format";
import { getAffiliateCode } from "@/lib/cart";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";

export const metadata = {
  title: "Checkout | Sierra de la Culebra Marketplace",
};

export default async function CheckoutPage() {
  const session = await auth();
  const cart = await loadCart();
  const affiliateCode = await getAffiliateCode();

  if (cart.items.length === 0) {
    redirect("/carrito");
  }

  return (
    <PageShell width="xl">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Carrito", href: "/carrito" },
          { label: "Checkout" },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mt-3 text-stone-600">
        Puedes comprar como invitado. Pago seguro y seguimiento del pedido por email.
      </p>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-10">
        <aside className="order-first h-fit rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 lg:order-last">
          <h2 className="font-medium">Resumen</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="min-w-0 break-words">
                  {item.productName}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
                </span>
                <span className="shrink-0">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2">
            <p className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </p>
            {Number(cart.discountAmount) > 0 ? (
              <p className="flex justify-between text-sm text-emerald-900">
                <span>Descuento</span>
                <span>-{formatPrice(cart.discountAmount)}</span>
              </p>
            ) : null}
            <p className="flex justify-between text-sm">
              <span>Envio</span>
              <span>
                {cart.shippingFree ? (
                  <span className="text-emerald-900">Gratis</span>
                ) : (
                  formatPrice(cart.shippingAmount)
                )}
              </span>
            </p>
            {!cart.shippingFree ? (
              <p className="text-xs text-stone-500">
                Anade {formatPrice(cart.amountToFreeShipping)} mas para envio gratis
                (umbral {formatPrice(cart.freeShippingThreshold)}).
              </p>
            ) : null}
            <p className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(cart.grandTotal)}</span>
            </p>
          </div>
          {affiliateCode ? (
            <p className="mt-3 text-xs text-stone-500">Ref. afiliado: {affiliateCode}</p>
          ) : null}
          <Link href="/carrito" className="mt-4 inline-block text-sm text-emerald-800">
            Volver al carrito
          </Link>
        </aside>

        <CheckoutForm
          defaultEmail={session?.user?.email ?? undefined}
          defaultName={session?.user?.name ?? undefined}
          couponCode={cart.couponCode}
          affiliateCode={affiliateCode}
        />
      </div>
    </PageShell>
  );
}
