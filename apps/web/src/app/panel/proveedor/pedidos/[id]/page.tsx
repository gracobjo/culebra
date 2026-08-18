import Link from "next/link";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getVendorOrder } from "@culebra/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { VendorOrderActions } from "@/components/orders/vendor-order-actions";

type VendorOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VendorOrderDetailPage({ params }: VendorOrderPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/pedidos");
  }

  const { id } = await params;
  let order;
  try {
    order = await getVendorOrder(session.user.id, id);
  } catch {
    notFound();
  }

  const shipping = order.shippingAddress;

  return (
    <PageShell width="md">
      <Link href="/panel/proveedor/pedidos" className="text-sm text-emerald-800">
        ← Volver a pedidos
      </Link>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} kind="vendor" />
      </div>
      <p className="mt-2 text-sm text-stone-500">{formatDate(order.createdAt)}</p>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-medium">Cliente y envio</h2>
        <p className="mt-3 text-sm text-stone-700">
          {order.customerName}
          <br />
          {order.customerEmail}
          {order.customerPhone ? (
            <>
              <br />
              {order.customerPhone}
            </>
          ) : null}
        </p>
        {shipping ? (
          <p className="mt-3 text-sm text-stone-600">
            {shipping.street}
            <br />
            {shipping.postalCode} {shipping.city} ({shipping.province})
          </p>
        ) : null}
        {order.notes ? (
          <p className="mt-3 text-sm text-stone-600">Notas: {order.notes}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-medium">Articulos</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="min-w-0 break-words">
                {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
              </span>
              <span className="shrink-0">{formatPrice(item.subtotalGross)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-stone-100 pt-3 font-medium">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalGross)}</span>
          </li>
        </ul>
      </section>

      {order.shipment ? (
        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="font-medium">Envio registrado</h2>
          <p className="mt-3 text-sm text-stone-600">
            {order.shipment.carrier ?? "Sin transportista"}
            {order.shipment.trackingNumber ? ` · ${order.shipment.trackingNumber}` : ""}
          </p>
        </section>
      ) : null}

      {order.allowedActions.length > 0 ? (
        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-medium">Gestionar</h2>
          <VendorOrderActions
            vendorOrderId={order.id}
            allowedActions={order.allowedActions}
          />
        </section>
      ) : null}

      <p className="mt-6 text-xs text-stone-500">
        El cobro con Stripe se conectara en la siguiente fase. Puedes preparar y
        enviar el pedido para completar el flujo logistico.
      </p>
    </PageShell>
  );
}
