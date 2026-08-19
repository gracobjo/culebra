import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import {
  createSandboxOrder,
  simulateConfirmAndShip,
  simulateDeliver,
  simulateFastForwardRetention,
  simulatePaymentOk,
  simulateReleasePayouts,
} from "./actions";

export const metadata = { title: "Sandbox | Admin" };

type OrderForSandbox = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  payment: { status: string } | null;
  vendorOrders: Array<{
    id: string;
    status: string;
    payout: { status: string; heldForWithdrawal: boolean; releasesAt: Date | null } | null;
  }>;
};

function badgeColor(status: string): string {
  if (status === "PAYMENT_PAID" || status === "PAID" || status === "ACTIVE" || status === "DELIVERED") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "PAYMENT_PENDING" || status === "PENDING") {
    return "bg-stone-100 text-stone-700 border-stone-200";
  }
  if (status === "SHIPPED" || status === "IN_PREPARATION") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (status === "FAILED" || status === "PAYMENT_FAILED") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-stone-100 text-stone-700 border-stone-200";
}

export default async function AdminSandboxPage() {
  await requireAdmin();

  const orders = (await prisma.order.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { status: true } },
      vendorOrders: {
        include: { payout: { select: { status: true, heldForWithdrawal: true, releasesAt: true } } },
      },
    },
  })) as unknown as OrderForSandbox[];

  return (
    <AdminShell title="Sandbox de pruebas (Villardeciervos)">
      <div className="space-y-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-base font-semibold text-emerald-900">Objetivo del sandbox</h2>
          <p className="mt-1 text-sm text-stone-600">
            Simular el flujo real del marketplace para validar: pago + split (Stripe Connect) + logística + emails.
            Está pensado para ejecutar en local sin Stripe real.
          </p>
          <form action={createSandboxOrder} className="mt-4 flex flex-wrap gap-3 items-center">
            <button type="submit" className="btn btn-primary">
              Crear pedido sandbox (listo para pago)
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-6 py-4">
            <h2 className="text-base font-semibold">Pedidos recientes</h2>
            <p className="mt-1 text-sm text-stone-500">
              Sobre cada pedido puedes ejecutar pasos: pago OK, confirmación + envío, retención payouts y entrega.
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.length === 0 ? (
              <div className="p-10 text-center text-stone-500">No hay pedidos.</div>
            ) : (
              orders.map((o) => {
                const paymentStatus = o.payment?.status ?? "NO_PAYMENT";
                const anyHeld = o.vendorOrders.some((vo) => vo.payout?.heldForWithdrawal);
                const allShipped = o.vendorOrders.every(
                  (vo) => vo.status === "SHIPPED" || vo.status === "DELIVERED",
                );
                const anyShipped = o.vendorOrders.some((vo) => vo.status === "SHIPPED" || vo.status === "DELIVERED");
                const paymentOk = paymentStatus === "PAYMENT_PAID";

                return (
                  <div key={o.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-emerald-800">Pedido {o.orderNumber}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          Estado pedido: <span className="font-medium">{o.status}</span>
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          Pago:{" "}
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${badgeColor(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <form action={simulatePaymentOk}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={paymentStatus === "PAYMENT_PAID"}
                          >
                            Simular pago OK
                          </button>
                        </form>

                        <form action={simulateConfirmAndShip}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={!paymentOk || allShipped}
                            title="Confirma (si procede) y marca SHIPPED con tracking SANDBOX"
                          >
                            Confirmar + Enviar
                          </button>
                        </form>

                        <form action={simulateFastForwardRetention}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <button type="submit" className="btn btn-secondary" disabled={!anyHeld}>
                            Fast-forward retención
                          </button>
                        </form>

                        <form action={simulateReleasePayouts}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <button type="submit" className="btn btn-secondary" disabled={!anyHeld}>
                            Liberar payouts (sandbox)
                          </button>
                        </form>

                        <form action={simulateDeliver}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={!anyShipped || allShipped}
                          >
                            Marcar entregado
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {o.vendorOrders.slice(0, 3).map((vo) => (
                        <div key={vo.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                          <p className="text-sm font-medium text-stone-700">VendorOrder {vo.id.slice(0, 8)}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            Estado:{" "}
                            <span className={`font-medium rounded-full border px-2 py-0.5 ${badgeColor(vo.status)}`}>
                              {vo.status}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Payout:{" "}
                            {vo.payout ? (
                              <span className={`font-medium rounded-full border px-2 py-0.5 ${badgeColor(vo.payout.status)}`}>
                                {vo.payout.status} {vo.payout.heldForWithdrawal ? "· retenido" : "· liberado"}
                              </span>
                            ) : (
                              <span className="text-stone-400">—</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

