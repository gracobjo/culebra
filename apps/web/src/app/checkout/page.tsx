import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadCart } from "../carrito/actions";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Checkout | Sierra de la Culebra Marketplace",
};

export default async function CheckoutPage() {
  const session = await auth();
  const cart = await loadCart();

  if (cart.items.length === 0) {
    redirect("/carrito");
  }

  return (
    <PageShell width="xl">
      <h1 className="text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mt-3 text-stone-600">
        Puedes comprar como invitado. Recogeremos datos de envio y facturacion.
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
          <p className="mt-6 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </p>
          <Link href="/carrito" className="mt-4 inline-block text-sm text-emerald-800">
            Volver al carrito
          </Link>
        </aside>

        <CheckoutForm
          defaultEmail={session?.user?.email ?? undefined}
          defaultName={session?.user?.name ?? undefined}
        />
      </div>
    </PageShell>
  );
}
