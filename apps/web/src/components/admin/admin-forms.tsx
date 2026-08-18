"use client";

import { useActionState } from "react";
import {
  createCommissionRuleAction,
  createContractVersionAction,
  type AdminActionState,
} from "@/app/admin/actions";

const initial: AdminActionState = {};

export function VendorStatusForm({
  vendorId,
  action,
  status,
  label,
}: {
  vendorId: string;
  action: (vendorId: string, formData: FormData) => Promise<void>;
  status: string;
  label: string;
}) {
  return (
    <form action={action.bind(null, vendorId)}>
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-4 py-2 text-sm"
      >
        {label}
      </button>
    </form>
  );
}

export function ContractVersionForm({ vendorId }: { vendorId: string }) {
  const [state, formAction, pending] = useActionState(createContractVersionAction, initial);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="vendorId" value={vendorId} />
      <textarea
        name="conditions"
        rows={6}
        placeholder="Condiciones del contrato [REVISAR CON ABOGADO]"
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
      />
      <input
        name="commissionPercent"
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="Comision %"
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
      />
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear version de contrato"}
      </button>
    </form>
  );
}

export function CommissionRuleForm({ vendorId }: { vendorId: string }) {
  const [state, formAction, pending] = useActionState(createCommissionRuleAction, initial);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="vendorId" value={vendorId} />
      <select
        name="ruleType"
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
        defaultValue="PERCENTAGE"
      >
        <option value="PERCENTAGE">Porcentaje</option>
        <option value="FIXED">Fija por pedido</option>
      </select>
      <input
        name="percentage"
        type="number"
        step="0.01"
        min="0"
        max="100"
        placeholder="Porcentaje"
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
      />
      <input
        name="fixedAmount"
        type="number"
        step="0.01"
        min="0"
        placeholder="Importe fijo EUR"
        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
      />
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Crear regla de comision"}
      </button>
    </form>
  );
}
