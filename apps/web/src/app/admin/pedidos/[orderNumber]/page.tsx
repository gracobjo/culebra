import { notFound } from "next/navigation";
import { getOrderByNumberForAdmin } from "@culebra/auth";
import type { OrderDetail } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate, formatPrice, orderStatusLabels } from "@/lib/format";

type PageProps = { params: Promise<{ orderNumber: string }> };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { orderNumber } = await params;
  const order = await getOrderByNumberForAdmin(orderNumber);
  if (!order) {
    notFound();
  }

  return (
    <AdminShell title={order.orderNumber}>
      <p className="text-sm text-stone-600">
        {orderStatusLabels[order.status] ?? order.status} · {order.customerEmail} ·{" "}
        {formatDate(order.createdAt)}
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((item: OrderDetail["items"][number]) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.productName}
              {item.variantLabel ? ` (${item.variantLabel})` : ""} x{item.quantity}
            </span>
            <span>{formatPrice(item.subtotalGross)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-stone-200 pt-2 font-medium">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </li>
      </ul>
    </AdminShell>
  );
}
