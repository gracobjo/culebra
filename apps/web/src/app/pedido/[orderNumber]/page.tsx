import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOrderByNumber } from "@culebra/auth";
import { guestCanAccessOrder } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  return { title: `Pedido ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  const guestAccess = await guestCanAccessOrder(orderNumber);
  const order = await getOrderByNumber(orderNumber, {
    userId: session?.user?.id,
    guestAccess,
  });

  if (!order) {
    notFound();
  }

  return (
    <PageShell width="md">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">Pedido confirmado</p>
      <h1 className="mt-2 break-all text-3xl font-semibold sm:text-4xl">{order.orderNumber}</h1>
      <p className="mt-4 text-stone-600">
        Hemos registrado tu pedido. El pago online se conectara en la siguiente
        fase. Recibiras confirmacion en {order.customerEmail}.
      </p>
      <p className="mt-2 text-sm text-stone-500">
        Estado: {order.status} · Pago: {order.paymentStatus ?? "pendiente"}
      </p>

      <ul className="mt-8 space-y-3 rounded-3xl border border-stone-200 bg-white p-4 sm:p-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0 break-words">
              {item.productName}
              {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
            </span>
            <span>{formatPrice(item.subtotalGross)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-stone-100 pt-3 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </li>
      </ul>

      <p className="mt-6 text-sm text-stone-600">
        El pedido se ha dividido internamente entre {order.vendorCount} productor
        {order.vendorCount === 1 ? "" : "es"}.
      </p>

      <Link href="/productos" className="mt-8 inline-block text-sm text-emerald-800">
        Seguir comprando
      </Link>
    </PageShell>
  );
}
