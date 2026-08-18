import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listVendorOrders, type VendorOrderDetail } from "@culebra/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const metadata = {
  title: "Pedidos | Panel productor",
};

export default async function VendorOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/pedidos");
  }

  let orders: VendorOrderDetail[] = [];
  try {
    orders = await listVendorOrders(session.user.id);
  } catch {
    redirect("/quiero-vender");
  }

  return (
    <PageShell width="xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
            Panel productor
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Pedidos</h1>
        </div>
        <Link href="/panel/proveedor" className="text-sm text-emerald-800">
          Volver al perfil
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-6 text-center text-stone-600 sm:p-10">
          Todavia no tienes pedidos.
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/panel/proveedor/pedidos/${order.id}`}
                className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-stone-500">
                    {order.customerName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <OrderStatusBadge status={order.status} kind="vendor" />
                  <span className="font-medium">{formatPrice(order.subtotalGross)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
