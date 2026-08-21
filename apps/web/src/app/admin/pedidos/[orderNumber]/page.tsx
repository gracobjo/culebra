import { notFound } from "next/navigation";
import { getOrderByNumberForAdmin } from "@culebra/auth";
import type { OrderDetail } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { DownloadOrderDocumentButton } from "@/components/orders/download-order-document-button";
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
      <div className="mt-4">
        <DownloadOrderDocumentButton
          href={`/api/admin/orders/${order.orderNumber}/document`}
          label="Descargar PDF del pedido"
        />
      </div>
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
        <li className="flex justify-between border-t border-stone-200 pt-2 text-stone-600">
          <span>Productos (bruto artesanos)</span>
          <span>{formatPrice(order.subtotalGross)}</span>
        </li>
        <li className="flex justify-between text-stone-600">
          <span>Envío (a cargo del cliente)</span>
          <span>{formatPrice(order.shippingAmount)}</span>
        </li>
        <li className="flex justify-between border-t border-stone-200 pt-2 font-medium">
          <span>Total cobrado al cliente</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </li>
        <li className="pt-1 text-xs text-stone-500">
          El total = productos + envío. La comisión del marketplace se aplica solo sobre el bruto
          de productos; el envío no entra en la liquidación del artesano.
        </li>
      </ul>
    </AdminShell>
  );
}
