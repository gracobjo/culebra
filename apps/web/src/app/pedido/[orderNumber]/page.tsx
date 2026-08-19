import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOrderByNumber, isStripeConfigured } from "@culebra/auth";
import { prisma } from "@culebra/db";
import { guestCanAccessOrder } from "@/lib/cart";
import { formatDate, formatPrice, vendorOrderStatusLabels } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PayOrderButton } from "@/components/orders/pay-order-button";
import { ReviewForm } from "@/components/orders/review-form";

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ pago?: string }>;
};

export async function generateMetadata({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  return { title: `Pedido ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { pago } = await searchParams;
  const session = await auth();
  const guestAccess = await guestCanAccessOrder(orderNumber);
  const order = await getOrderByNumber(orderNumber, {
    userId: session?.user?.id,
    guestAccess,
  });

  if (!order) {
    notFound();
  }

  const shipping = order.shippingAddress;
  const isPaid = ["PAYMENT_PAID"].includes(order.paymentStatus ?? "");

  // Cargar reviews existentes del usuario para este pedido (evitar duplicar el form)
  const existingReviewProductIds = session?.user?.id && isPaid
    ? new Set(
        (await prisma.review.findMany({
          where: { userId: session.user.id, orderId: order.id },
          select: { productId: true },
        })).map((r) => r.productId),
      )
    : new Set<string>();

  return (
    <PageShell width="md">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
        Pedido
      </p>
      <h1 className="mt-2 break-all text-3xl font-semibold sm:text-4xl">{order.orderNumber}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-stone-500">{formatDate(order.createdAt)}</span>
      </div>
      <p className="mt-4 text-stone-600">
        Confirmacion enviada a {order.customerEmail}.
        {order.paymentStatus === "PAYMENT_PAID"
          ? " El pago se ha recibido."
          : isStripeConfigured()
            ? " Completa el pago para que los productores preparen el envio."
            : " El pago online se activara cuando Stripe este configurado."}
      </p>
      {pago === "ok" && order.paymentStatus !== "PAYMENT_PAID" ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Estamos confirmando el pago. Recarga en unos segundos si el estado no cambia.
        </p>
      ) : null}
      {pago === "cancelado" ? (
        <p className="mt-3 rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
          El pago se cancelo. Puedes intentarlo de nuevo cuando quieras.
        </p>
      ) : null}
      {order.paymentStatus === "PAYMENT_PAID" ? (
        <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Pedido pagado.
        </p>
      ) : null}
      {order.paymentStatus !== "PAYMENT_PAID" &&
      order.status !== "CANCELLED" &&
      isStripeConfigured() ? (
        <PayOrderButton orderNumber={order.orderNumber} />
      ) : null}

      <ul className="mt-8 space-y-3 rounded-3xl border border-stone-200 bg-white p-4 sm:p-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0 break-words">
              {item.productName}
              {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
            </span>
            <span className="shrink-0">{formatPrice(item.subtotalGross)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-stone-100 pt-3 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </li>
      </ul>

      {shipping ? (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="font-medium">Envio</h2>
          <p className="mt-2 text-sm text-stone-600">
            {shipping.firstName} {shipping.lastName}
            <br />
            {shipping.street}
            <br />
            {shipping.postalCode} {shipping.city} ({shipping.province})
          </p>
        </section>
      ) : null}

      <section className="mt-8 space-y-4">
        <h2 className="font-medium">Seguimiento por productor</h2>
        {order.vendorOrders.map((vendorOrder) => (
          <article
            key={vendorOrder.id}
            className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{vendorOrder.vendorName}</h3>
              <OrderStatusBadge status={vendorOrder.status} kind="vendor" />
            </div>
            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              {vendorOrder.items.map((item) => (
                <li key={item.id}>
                  {item.productName}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
                </li>
              ))}
            </ul>
            {vendorOrder.shipment?.trackingNumber ? (
              <p className="mt-3 text-sm">
                Seguimiento: {vendorOrder.shipment.carrier ?? "transporte"}{" "}
                <span className="font-medium">{vendorOrder.shipment.trackingNumber}</span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                {vendorOrderStatusLabels[vendorOrder.status] ?? vendorOrder.status}
              </p>
            )}
          </article>
        ))}
      </section>

      {/* Formulario de valoraciones: solo para usuarios autenticados con pedido pagado */}
      {session?.user && isPaid ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Valora tu compra</h2>
          <p className="mt-1 text-sm text-stone-500">
            Tu opinion ayuda a otros compradores y a mejorar la calidad de los artesanos.
          </p>
          <div className="mt-4 space-y-4">
            {order.items
              .filter((item) => item.productId && !existingReviewProductIds.has(item.productId ?? ""))
              .map((item) => (
                item.productId && item.vendorId ? (
                  <ReviewForm
                    key={item.id}
                    orderNumber={order.orderNumber}
                    productId={item.productId}
                    productName={item.productName}
                    vendorId={item.vendorId}
                  />
                ) : null
              ))}
            {order.items.every(
              (item) => !item.productId || existingReviewProductIds.has(item.productId ?? ""),
            ) ? (
              <p className="text-sm text-stone-500">Ya has valorado todos los productos de este pedido.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {session?.user ? (
          <Link href="/cuenta/pedidos" className="text-sm text-emerald-800">
            Ver mis pedidos
          </Link>
        ) : (
          <Link href="/pedido/consultar" className="text-sm text-emerald-800">
            Consultar otro pedido
          </Link>
        )}
        <Link href="/productos" className="text-sm text-emerald-800">
          Seguir comprando
        </Link>
      </div>
    </PageShell>
  );
}
