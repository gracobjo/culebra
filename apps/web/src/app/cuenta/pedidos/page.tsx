import Link from "next/link";
import { auth } from "@/auth";
import { listOrdersForUser } from "@culebra/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const metadata = {
  title: "Mis pedidos | Sierra de la Culebra Marketplace",
};

export default async function AccountOrdersPage() {
  const session = await auth();
  const orders = session?.user?.id ? await listOrdersForUser(session.user.id) : [];

  return (
    <PageShell width="lg">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
        Mi cuenta
      </p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Mis pedidos</h1>
      <p className="mt-3 text-stone-600">
        Consulta el estado de tus compras y el envio de cada productor.
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-6 text-center text-stone-600 sm:p-10">
          Todavia no tienes pedidos.{" "}
          <Link href="/productos" className="text-emerald-800 underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/pedido/${order.orderNumber}`}
                className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-stone-500">
                    {formatDate(order.createdAt)} · {order.itemCount} articulos ·{" "}
                    {order.vendorCount} productor{order.vendorCount === 1 ? "" : "es"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/cuenta" className="mt-8 inline-block text-sm text-emerald-800">
        Volver a la cuenta
      </Link>
    </PageShell>
  );
}
