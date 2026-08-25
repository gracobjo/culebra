"use client";

import { useId } from "react";
import { useActionState } from "react";
import {
  deleteShowroomDailyStatAction,
  importShowroomDemoDataAction,
  syncShowroomDailyStatsAction,
  upsertShowroomDailyStatAction,
  type ShowroomStatsAdminState,
} from "@/app/admin/showroom/estadisticas/actions";
import { showroomFormFieldHint } from "@/lib/showroom-stats-a11y";

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
  hint: hintOverride,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  step?: string;
  min?: string;
  max?: string;
  className?: string;
  compact?: boolean;
  hint?: string;
}) {
  const inputId = useId();
  const hintId = useId();
  const hint = hintOverride ?? showroomFormFieldHint(name);

  return (
    <div className={`min-w-0 text-sm ${className ?? ""}`}>
      <label htmlFor={inputId} className="block">
        <span
          className={
            compact
              ? "a11y-hint block min-h-[2.5rem] cursor-help text-xs font-medium leading-snug text-stone-700 break-words"
              : "a11y-hint block cursor-help font-medium text-stone-700"
          }
          data-hint={hint}
          title={hint}
        >
          {label}
          <span className="sr-only">. {hint}</span>
        </span>
      </label>
      {hint ? (
        <p id={hintId} className="mt-0.5 text-xs leading-snug text-stone-500">
          {hint}
        </p>
      ) : null}
      <input
        id={inputId}
        type={type}
        name={name}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        aria-describedby={hint ? hintId : undefined}
        className="mt-1 w-full min-w-0 rounded-lg border border-stone-300 px-2 py-2 text-sm tabular-nums sm:px-3"
      />
    </div>
  );
}

function CheckField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const hintText = hint ?? showroomFormFieldHint(name);
  const hintId = useId();

  return (
    <div>
      <label className="a11y-hint flex cursor-help items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 accent-emerald-800"
          aria-describedby={hintText ? hintId : undefined}
        />
        <span data-hint={hintText} title={hintText}>
          {label}
        </span>
      </label>
      {hintText ? (
        <p id={hintId} className="ml-6 text-xs text-stone-500">
          {hintText}
        </p>
      ) : null}
    </div>
  );
}

function StatusBanner({ state }: { state: ShowroomStatsAdminState }) {
  if (state.error) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        role="status"
      >
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
    <section
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      aria-labelledby="showroom-form-heading"
    >
      <h2 id="showroom-form-heading" className="text-lg font-semibold text-stone-900">
        Registrar día
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Captura quincenal o diaria. Pasa el ratón sobre cada etiqueta para ver qué significa. Columnas
        alineadas con{" "}
        <code className="rounded bg-stone-100 px-1 text-xs">culebra_showroom_daily.csv</code>.
      </p>

      <form action={action} className="mt-4 space-y-4" aria-describedby="showroom-form-intro">
        <p id="showroom-form-intro" className="sr-only">
          Formulario de estadísticas diarias del showroom. Cada campo incluye una definición accesible
          para lectores de pantalla y tooltip al pasar el ratón.
        </p>
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
          <Field
            label="Attach impulso (%)"
            name="impulseAttachPct"
            defaultValue={0}
            step="0.1"
            min="0"
            max="100"
          />
          <Field label="€ medio impulso" name="impulseAvgEur" defaultValue={0} step="0.01" min="0" />
          <Field label="Quick buy (%)" name="quickBuyPct" defaultValue={0} step="0.1" min="0" max="100" />
          <Field
            label="Ticket quick buy (€)"
            name="quickBuyTicket"
            defaultValue={0}
            step="0.01"
            min="0"
          />
        </div>

        <fieldset className="rounded-xl border border-stone-200 p-4">
          <legend className="px-1 text-sm font-semibold text-stone-800">
            Lista de 8 — unidades
          </legend>
          <p className="mb-2 text-xs text-stone-500">
            Ocho referencias de impulso en caja: miel, loncheado, mermelada, queso, tote, picos, vino
            y mini-cata.
          </p>
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

        <div>
          <label htmlFor="showroom-notes" className="block text-sm">
            <span
              className="a11y-hint block cursor-help font-medium text-stone-700"
              data-hint="Observaciones libres del día (evento local, incidencia, etc.)."
              title="Notas del día"
            >
              Notas
            </span>
          </label>
          <p id="showroom-notes-hint" className="mt-0.5 text-xs text-stone-500">
            Observaciones libres del día (evento local, incidencia, etc.).
          </p>
          <textarea
            id="showroom-notes"
            name="notes"
            rows={2}
            aria-describedby="showroom-notes-hint"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>

        <StatusBanner state={state} />

        <button
          type="submit"
          disabled={pending}
          className="a11y-hint rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
          data-hint="Guarda o actualiza el registro del día seleccionado en la base de datos."
          title="Guardar registro del día"
          aria-label={pending ? "Guardando registro" : "Guardar día en estadísticas showroom"}
        >
          {pending ? "Guardando…" : "Guardar día"}
        </button>
      </form>
    </section>
  );
}

export function ShowroomDailyStatDemoPanel({ hasData }: { hasData: boolean }) {
  const [state, action, pending] = useActionState(importShowroomDemoDataAction, initial);

  return (
    <section
      className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5"
      aria-labelledby="showroom-demo-heading"
    >
      <h2 id="showroom-demo-heading" className="text-base font-semibold text-stone-900">
        Datos demo (EDA / CSV)
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Importa ~730 días desde{" "}
        <code className="rounded bg-white px-1 text-xs">data/synthetic/culebra_showroom_daily.csv</code>
        {hasData ? " (sustituye los registros actuales)." : " para ver gráficos y probar la exportación."}
      </p>
      <form action={action} className="mt-3">
        <button
          type="submit"
          disabled={pending}
          className="a11y-hint rounded-full bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-60"
          data-hint="Carga datos sintéticos de demostración para probar gráficos e informes."
          title="Importar CSV sintético"
          aria-label={
            pending
              ? "Importando datos demo"
              : hasData
                ? "Recargar dataset demo sintético"
                : "Cargar dataset demo sintético"
          }
        >
          {pending ? "Importando…" : hasData ? "Recargar demo sintético" : "Cargar demo sintético"}
        </button>
      </form>
      <StatusBanner state={state} />
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
    <section
      className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
      aria-labelledby="showroom-sync-heading"
    >
      <h2 id="showroom-sync-heading" className="text-base font-semibold text-stone-900">
        Sincronizar desde la app
      </h2>
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
          className="a11y-hint rounded-full border border-emerald-800 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
          data-hint="Importa pedidos web y eventos CRM al rango de fechas indicado."
          title="Sincronizar métricas automáticas"
          aria-label={pending ? "Sincronizando datos" : "Sincronizar pedidos y CRM"}
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
    <section
      className="rounded-2xl border border-stone-200 bg-white p-5"
      aria-labelledby="showroom-delete-heading"
    >
      <h2 id="showroom-delete-heading" className="text-base font-semibold text-stone-900">
        Eliminar registro
      </h2>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="a11y-hint font-medium text-stone-700" data-hint="Fecha del registro a borrar." title="Fecha a eliminar">
            Fecha
          </span>
          <select
            name="date"
            aria-label="Fecha del registro a eliminar"
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
          className="a11y-hint rounded-full border border-red-300 px-4 py-2 text-sm text-red-800 hover:bg-red-50 disabled:opacity-60"
          data-hint="Elimina permanentemente el día seleccionado."
          title="Eliminar registro"
          aria-label="Eliminar registro del día seleccionado"
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
        className="a11y-hint inline-flex items-center rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-900"
        data-hint="Descarga CSV con 43 columnas compatible con notebooks Python."
        title="Exportar CSV para análisis"
        aria-label="Exportar CSV de estadísticas showroom para notebooks"
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
