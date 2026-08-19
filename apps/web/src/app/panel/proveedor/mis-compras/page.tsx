import Link from "next/link";
import { auth } from "@/auth";
import { listOrdersForUser, listStoredDocumentsForUser } from "@culebra/auth";
import { redirect } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { DownloadOrderDocumentButton } from "@/components/orders/download-order-document-button";

export const metadata = {
  title: "Mis compras | Panel productor",
};

export default async function VendorConsumerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/panel/proveedor/mis-compras");
  }

  const [orders, storedDocs] = await Promise.all([
    listOrdersForUser(session.user.id),
    listStoredDocumentsForUser(session.user.id, "ORDER_CUSTOMER"),
  ]);

  return (
    <PageShell width="lg">
      <Link href="/panel/proveedor" className="text-sm text-emerald-800">
        ← Volver al panel
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-emerald-800 sm:text-sm">
        Como consumidor
      </p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Mis compras</h1>
      <p className="mt-3 text-sm text-stone-600">
        Pedidos que has realizado en el marketplace como cliente final. Puedes descargar el
        justificante PDF de cada transaccion (conservado minimo 4 anos).
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-6 text-center text-stone-600">
          Todavia no has comprado como consumidor.{" "}
          <Link href="/productos" className="text-emerald-800 underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-3xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href={`/pedido/${order.orderNumber}`}
                    className="font-medium text-emerald-900"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDate(order.createdAt)} · {order.itemCount} articulos
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                  <DownloadOrderDocumentButton
                    href={`/api/orders/${order.orderNumber}/document`}
                    label="PDF"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {storedDocs.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Documentos archivados</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {storedDocs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
              >
                <span>
                  {doc.title} · {formatDate(doc.createdAt)}
                </span>
                <DownloadOrderDocumentButton
                  href={`/api/stored-documents/${doc.id}/document`}
                  label="Descargar"
                  className="inline-flex items-center text-emerald-800 underline"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
