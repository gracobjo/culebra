import Link from "next/link";
import { listOrdersForAdmin } from "@culebra/auth";
import type { AdminOrderListItem } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate, formatPrice, orderStatusLabels } from "@/lib/format";

export const metadata = { title: "Pedidos | Admin" };

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listOrdersForAdmin();

  return (
    <AdminShell title="Pedidos">
      <ul className="space-y-3">
        {orders.items.map((order: AdminOrderListItem) => (
          <li key={order.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/admin/pedidos/${order.orderNumber}`}
                className="font-medium text-emerald-800"
              >
                {order.orderNumber}
              </Link>
              <span className="text-sm">{orderStatusLabels[order.status] ?? order.status}</span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {order.customerEmail} · {formatPrice(order.totalAmount)} · {formatDate(order.createdAt)}
            </p>
          </li>
        ))}
      </ul>
      {orders.items.length === 0 ? (
        <p className="text-sm text-stone-600">No hay pedidos.</p>
      ) : null}
    </AdminShell>
  );
}
