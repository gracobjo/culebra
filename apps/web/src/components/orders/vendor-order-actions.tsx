"use client";

import { useActionState } from "react";
import {
  updateVendorOrderStatusAction,
  type VendorOrderActionState,
} from "@/app/panel/proveedor/pedidos/actions";

const initialState: VendorOrderActionState = {};

const actionLabels: Record<string, string> = {
  CONFIRMED: "Confirmar pedido",
  IN_PREPARATION: "Marcar en preparacion",
  DELIVERED: "Marcar entregado",
  CANCELLED: "Cancelar pedido",
};

export function VendorOrderActions({
  vendorOrderId,
  allowedActions,
}: {
  vendorOrderId: string;
  allowedActions: string[];
}) {
  const [state, formAction, pending] = useActionState(
    updateVendorOrderStatusAction.bind(null, vendorOrderId),
    initialState,
  );

  const simpleActions = allowedActions.filter((action) => action !== "SHIPPED");
  const canShip = allowedActions.includes("SHIPPED");

  return (
    <div className="space-y-4">
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

      {simpleActions.map((action) => (
        <form action={formAction} key={action}>
          <input type="hidden" name="status" value={action} />
          <button
            type="submit"
            disabled={pending}
            className={`min-h-11 w-full rounded-full px-5 py-3 text-sm font-medium sm:w-auto ${
              action === "CANCELLED"
                ? "border border-stone-400"
                : "bg-emerald-800 text-white"
            } disabled:opacity-60`}
          >
            {pending ? "Guardando..." : actionLabels[action] ?? action}
          </button>
        </form>
      ))}

      {canShip ? (
        <form action={formAction} className="space-y-3 rounded-2xl border border-stone-200 p-4">
          <input type="hidden" name="status" value="SHIPPED" />
          <p className="text-sm font-medium">Registrar envio</p>
          <input
            name="carrier"
            placeholder="Transportista (opcional)"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <input
            name="trackingNumber"
            placeholder="Numero de seguimiento (opcional)"
            className="min-h-11 w-full rounded-xl border border-stone-300 px-4 py-3"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Guardando..." : "Marcar como enviado"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
