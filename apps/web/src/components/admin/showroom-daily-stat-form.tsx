"use client";

import { useActionState } from "react";
import {
  deleteShowroomDailyStatAction,
  syncShowroomDailyStatsAction,
  upsertShowroomDailyStatAction,
  type ShowroomStatsAdminState,
} from "@/app/admin/showroom/estadisticas/actions";

const initial: ShowroomStatsAdminState = {};

function Field({
  label,
  name,
  type = "number",
  defaultValue,
  step,
  min,
  max,
  className,
  compact,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  step?: string;
  min?: string;
  max?: string;
  className?: string;
  /** Etiqueta multilínea contenida en la celda (lista de 8). */
  compact?: boolean;
}) {
  return (
    <label className={`block min-w-0 text-sm ${className ?? ""}`}>
      <span
        className={
          compact
            ? "block min-h-[2.5rem] text-xs font-medium leading-snug text-stone-700 break-words"
            : "block font-medium text-stone-700"
        }
      >
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        className="mt-1 w-full min-w-0 rounded-lg border border-stone-300 px-2 py-2 text-sm tabular-nums sm:px-3"
      />
    </label>
  );
}

function CheckField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-emerald-800"
      />
      {label}
    </label>
  );
}

function StatusBanner({ state }: { state: ShowroomStatsAdminState }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        {state.success}
      </p>
    );
  }
  return null;
}

export function ShowroomDailyStatForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [state, action, pending] = useActionState(upsertShowroomDailyStatAction, initial);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Registrar día</h2>
      <p className="mt-1 text-sm text-stone-600">
        Captura quincenal o diaria. Columnas alineadas con{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">culebra_showroom_daily.csv</code>.
      </p>

      <form action={action} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Fecha *" name="date" type="date" defaultValue={today} />
          <div className="flex flex-col justify-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
            <CheckField label="Día abierto" name="open" defaultChecked />
            <CheckField label="Promoción" name="promotion" />
            <CheckField label="Festivo / evento" name="holidayOrEvent" />
          </div>
          <Field label="Visitas" name="visits" defaultValue={0} min="0" />
          <Field label="Compras" name="purchases" defaultValue={0} min="0" />
          <Field label="GMV (€)" name="gmv" defaultValue={0} step="0.01" min="0" />
          <Field label="Ticket base (€)" name="avgTicketBase" defaultValue={0} step="0.01" min="0" />
          <Field label="Attach impulso (%)" name="impulseAttachPct" defaultValue={0} step="0.1" min="0" max="100" />
          <Field label="€ medio impulso" name="impulseAvgEur" defaultValue={0} step="0.01" min="0" />
          <Field label="Quick buy (%)" name="quickBuyPct" defaultValue={0} step="0.1" min="0" max="100" />
          <Field label="Ticket quick buy (€)" name="quickBuyTicket" defaultValue={0} step="0.01" min="0" />
        </div>

        <fieldset className="rounded-xl border border-stone-200 p-4">
          <legend className="px-1 text-sm font-semibold text-stone-800">Lista de 8 — unidades</legend>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
            <Field compact label="Miel" name="mielU" defaultValue={0} min="0" />
            <Field compact label="Loncheado" name="loncheadoU" defaultValue={0} min="0" />
            <Field compact label="Mermelada" name="mermeladaU" defaultValue={0} min="0" />
            <Field compact label="Queso" name="quesoU" defaultValue={0} min="0" />
            <Field compact label="Tote" name="toteU" defaultValue={0} min="0" />
            <Field compact label="Picos" name="picosU" defaultValue={0} min="0" />
            <Field compact label="Vino" name="vinoU" defaultValue={0} min="0" />
            <Field compact label="Mini-cata" name="minicataU" defaultValue={0} min="0" />
          </div>
          <div className="mt-4 max-w-xs">
            <Field label="Stock tote fin de día" name="toteStock" defaultValue={0} min="0" />
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Pedidos online" name="onlineOrders" defaultValue={0} min="0" />
          <Field label="Online atrib. showroom" name="onlineOrdersAttr" defaultValue={0} min="0" />
          <Field label="Contactos captados" name="contacts" defaultValue={0} min="0" />
          <Field label="Visitas referidas" name="referredVisits" defaultValue={0} min="0" />
          <Field label="Cestas vía alojamientos" name="basketsViaLodging" defaultValue={0} min="0" />
          <Field label="Partners activos" name="partnersActive" defaultValue={0} min="0" />
          <Field label="Market segment" name="marketSegment" type="text" defaultValue="" />
          <Field label="Canal distribución" name="distributionChannel" type="text" defaultValue="" />
        </div>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">Notas</span>
          <textarea
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <StatusBanner state={state} />

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar día"}
        </button>
      </form>
    </section>
  );
}

export function ShowroomDailyStatSyncPanel({
  defaultFrom,
  defaultTo,
}: {
  defaultFrom: string;
  defaultTo: string;
}) {
  const [state, action, pending] = useActionState(syncShowroomDailyStatsAction, initial);

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <h2 className="text-base font-semibold text-stone-900">Sincronizar desde la app</h2>
      <p className="mt-1 text-sm text-stone-600">
        Rellena pedidos online (con/sin afiliado) y eventos CRM REFERRAL/BASKET por fecha. No
        sobrescribe visitas ni GMV manuales.
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
        <Field label="Desde" name="from" type="date" defaultValue={defaultFrom} className="min-w-[10rem]" />
        <Field label="Hasta" name="to" type="date" defaultValue={defaultTo} className="min-w-[10rem]" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
        >
          {pending ? "Sincronizando…" : "Sincronizar"}
        </button>
      </form>
      <StatusBanner state={state} />
    </section>
  );
}

export function ShowroomDailyStatDeleteForm({ dates }: { dates: string[] }) {
  const [state, action, pending] = useActionState(deleteShowroomDailyStatAction, initial);

  if (dates.length === 0) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="text-base font-semibold text-stone-900">Eliminar registro</h2>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Fecha</span>
          <select
            name="date"
            className="mt-1 block min-w-[12rem] rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {[...dates].reverse().map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-50 disabled:opacity-60"
        >
          Eliminar
        </button>
      </form>
      <StatusBanner state={state} />
    </section>
  );
}

export function ShowroomDailyStatExportLinks({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const href = `/api/admin/showroom/daily-stats/export${qs ? `?${qs}` : ""}`;

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={href}
        className="inline-flex items-center rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900"
      >
        Exportar CSV (notebooks)
      </a>
      <span className="self-center text-xs text-stone-500">
        43 columnas · compatible con{" "}
        <code className="rounded bg-stone-100 px-1">culebra_showroom_synthetic_notebook.ipynb</code>
      </span>
    </div>
  );
}
