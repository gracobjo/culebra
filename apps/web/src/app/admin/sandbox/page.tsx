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
import { SandboxSubmitButton } from "./sandbox-submit-button";

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

const ERROR_MESSAGES: Record<string, string> = {
  CONSUMER_NOT_FOUND:
    "No existe el usuario de prueba laura.garcia@example.com. Ejecuta el seed de la base de datos.",
  PRODUCT_NOT_FOUND_FOR_SANDBOX:
    "No hay productos publicados con stock para crear el pedido sandbox.",
  CART_EMPTY: "El carrito quedó vacío antes del checkout.",
  INSUFFICIENT_STOCK: "Stock insuficiente en el producto elegido.",
  ORDER_NUMBER_REQUIRED: "Falta el número de pedido.",
  NO_HELD_PAYOUTS:
    "No hay payouts retenidos en este pedido. Primero simula el pago OK (así se crea el payout con retención de 14 días).",
  NOTHING_TO_DELIVER: "No hay líneas en estado SHIPPED para marcar como entregadas.",
};

function badgeColor(status: string): string {
  if (
    status === "PAYMENT_PAID" ||
    status === "PAID" ||
    status === "ACTIVE" ||
    status === "DELIVERED"
  ) {
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

type AdminSandboxPageProps = {
  searchParams: Promise<{
    created?: string;
    paid?: string;
    shipped?: string;
    retention?: string;
    released?: string;
    delivered?: string;
    error?: string;
  }>;
};

export default async function AdminSandboxPage({ searchParams }: AdminSandboxPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const created = params.created?.trim() || "";
  const paid = params.paid?.trim() || "";
  const shipped = params.shipped?.trim() || "";
  const retention = params.retention?.trim() || "";
  const released = params.released?.trim() || "";
  const delivered = params.delivered?.trim() || "";
  const errorCode = params.error?.trim() || "";
  const errorKey = errorCode.includes(":") ? errorCode.split(":")[0]! : errorCode;
  const errorMessage =
    ERROR_MESSAGES[errorKey] ?? (errorCode ? `Error: ${errorCode}` : "");
  const highlightOrder =
    delivered || released || retention || shipped || paid || created;

  const orders = (await prisma.order.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: {
      payment: { select: { status: true } },
      vendorOrders: {
        include: {
          payout: { select: { status: true, heldForWithdrawal: true, releasesAt: true } },
        },
      },
    },
  })) as unknown as OrderForSandbox[];

  return (
    <AdminShell title="Sandbox de pruebas (Villardeciervos)">
      <div className="space-y-8">
        {created ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Pedido <strong>{created}</strong> creado. Está listo para pago: usa «Simular pago OK»
            en la lista de abajo.
          </div>
        ) : null}

        {paid ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Pago simulado OK para <strong>{paid}</strong>. Ya puedes «Confirmar + Enviar».
          </div>
        ) : null}

        {shipped ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Pedido <strong>{shipped}</strong> confirmado y marcado como enviado (SHIPPED).
          </div>
        ) : null}

        {retention ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Retención adelantada en <strong>{retention}</strong>: la fecha de liberación del
            payout ya está en el pasado. Siguiente paso: «Liberar payouts (sandbox)».
          </div>
        ) : null}

        {released ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Payouts liberados (simulados) para <strong>{released}</strong>.
          </div>
        ) : null}

        {delivered ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            Pedido <strong>{delivered}</strong> marcado como entregado.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-base font-semibold text-emerald-900">Objetivo del sandbox</h2>
          <p className="mt-1 text-sm text-stone-600">
            Simular el flujo real del marketplace para validar: pago + split (Stripe Connect) +
            logística + emails. Está pensado para ejecutar en local sin Stripe real.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-600">
            <li>Crear pedido sandbox (queda pendiente de pago).</li>
            <li>Simular pago OK (crea el payout retenido 14 días).</li>
            <li>Confirmar + enviar.</li>
            <li>
              Fast-forward retención: adelanta esos 14 días para poder liberar el payout ya.
            </li>
            <li>Liberar payouts (sandbox) y, si quieres, marcar entregado.</li>
          </ol>
          <form action={createSandboxOrder} className="mt-4 flex flex-wrap gap-3 items-center">
            <SandboxSubmitButton
              label="Crear pedido sandbox (listo para pago)"
              pendingLabel="Creando pedido…"
            />
          </form>
        </div>

        <div id="pedidos" className="rounded-3xl border border-stone-200 bg-white">
          <div className="border-b border-stone-100 px-6 py-4">
            <h2 className="text-base font-semibold">
              Pedidos recientes ({orders.length})
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Sobre cada pedido puedes ejecutar pasos: pago OK, confirmación + envío, retención
              payouts y entrega.
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.length === 0 ? (
              <div className="p-10 text-center text-stone-500">
                No hay pedidos. Pulsa «Crear pedido sandbox» arriba.
              </div>
            ) : (
              orders.map((o) => {
                const paymentStatus = o.payment?.status ?? "NO_PAYMENT";
                const anyHeld = o.vendorOrders.some((vo) => vo.payout?.heldForWithdrawal);
                const allShippedOrDelivered = o.vendorOrders.every(
                  (vo) => vo.status === "SHIPPED" || vo.status === "DELIVERED",
                );
                const anyAwaitingDelivery = o.vendorOrders.some(
                  (vo) => vo.status === "SHIPPED",
                );
                const paymentOk = paymentStatus === "PAYMENT_PAID";
                const isNew = highlightOrder !== "" && o.orderNumber === highlightOrder;

                return (
                  <div
                    key={o.id}
                    className={`px-6 py-4 ${isNew ? "bg-emerald-50/70 ring-1 ring-inset ring-emerald-200" : ""}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-emerald-800">
                          Pedido {o.orderNumber}
                          {isNew ? (
                            <span className="ml-2 rounded-full bg-emerald-800 px-2 py-0.5 text-xs font-medium text-white">
                              Nuevo
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          Estado pedido: <span className="font-medium">{o.status}</span>
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          Pago:{" "}
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${badgeColor(paymentStatus)}`}
                          >
                            {paymentStatus}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <form action={simulatePaymentOk}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <SandboxSubmitButton
                            label="Simular pago OK"
                            pendingLabel="Simulando pago…"
                            disabled={paymentStatus === "PAYMENT_PAID"}
                          />
                        </form>

                        <form action={simulateConfirmAndShip}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <SandboxSubmitButton
                            label="Confirmar + Enviar"
                            pendingLabel="Enviando…"
                            className="btn btn-secondary"
                            disabled={!paymentOk || allShippedOrDelivered}
                            title="Confirma (si procede) y marca SHIPPED con tracking SANDBOX"
                          />
                        </form>

                        <form action={simulateFastForwardRetention}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <SandboxSubmitButton
                            label="Fast-forward retención"
                            pendingLabel="Avanzando…"
                            className="btn btn-secondary"
                            disabled={!anyHeld}
                          />
                        </form>

                        <form action={simulateReleasePayouts}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <SandboxSubmitButton
                            label="Liberar payouts (sandbox)"
                            pendingLabel="Liberando…"
                            className="btn btn-secondary"
                            disabled={!anyHeld}
                          />
                        </form>

                        <form action={simulateDeliver}>
                          <input type="hidden" name="orderNumber" value={o.orderNumber} />
                          <SandboxSubmitButton
                            label="Marcar entregado"
                            pendingLabel="Marcando…"
                            className="btn btn-secondary"
                            disabled={!anyAwaitingDelivery}
                            title="Solo disponible cuando hay líneas en estado SHIPPED"
                          />
                        </form>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {o.vendorOrders.slice(0, 3).map((vo) => (
                        <div
                          key={vo.id}
                          className="rounded-2xl border border-stone-100 bg-stone-50 p-3"
                        >
                          <p className="text-sm font-medium text-stone-700">
                            VendorOrder {vo.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Estado:{" "}
                            <span
                              className={`font-medium rounded-full border px-2 py-0.5 ${badgeColor(vo.status)}`}
                            >
                              {vo.status}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Payout:{" "}
                            {vo.payout ? (
                              <span
                                className={`font-medium rounded-full border px-2 py-0.5 ${badgeColor(vo.payout.status)}`}
                              >
                                {vo.payout.status}{" "}
                                {vo.payout.heldForWithdrawal ? "· retenido" : "· liberado"}
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
