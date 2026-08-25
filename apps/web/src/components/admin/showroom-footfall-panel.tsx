"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  SHOWROOM_DISCOVERY_CHANNELS,
  SHOWROOM_DISCOVERY_CHANNEL_LABELS,
  SHOWROOM_FOOTFALL_TYPES,
  SHOWROOM_FOOTFALL_TYPE_LABELS,
  SHOWROOM_ORIGIN_GROUPS,
  SHOWROOM_ORIGIN_GROUP_LABELS,
  type ShowroomDiscoveryChannel,
  type ShowroomFootfallType,
  type ShowroomOriginGroup,
} from "@culebra/auth/showroom-footfall.schemas";
import type { ShowroomFootfallRecord } from "@culebra/auth";
import {
  createShowroomFootfallAction,
  deleteShowroomFootfallAction,
  type ShowroomStatsAdminState,
} from "@/app/admin/showroom/estadisticas/actions";

const initial: ShowroomStatsAdminState = {};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ChoiceButton({
  selected,
  onClick,
  children,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      data-hint={hint}
      className={`a11y-hint min-h-11 rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
        selected
          ? "border-emerald-800 bg-emerald-800 text-white"
          : "border-stone-300 bg-white text-stone-800 hover:border-emerald-700"
      }`}
    >
      {children}
    </button>
  );
}

export function ShowroomFootfallQuickCapture() {
  const [state, action, pending] = useActionState(createShowroomFootfallAction, initial);
  const [entryType, setEntryType] = useState<ShowroomFootfallType | null>(null);
  const [originGroup, setOriginGroup] = useState<ShowroomOriginGroup | null>(null);
  const [channel, setChannel] = useState<ShowroomDiscoveryChannel | "">("");
  const [date, setDate] = useState(todayIso);
  const [locality, setLocality] = useState("");
  const [contactCaptured, setContactCaptured] = useState(false);
  const [notes, setNotes] = useState("");
  const [showChannel, setShowChannel] = useState(false);

  const canSubmit = entryType && originGroup;

  const formKey = useMemo(
    () => (state.success ? state.success : "idle"),
    [state.success],
  );

  useEffect(() => {
    if (!state.success) return;
    setEntryType(null);
    setOriginGroup(null);
    setChannel("");
    setLocality("");
    setContactCaptured(false);
    setNotes("");
    setShowChannel(false);
    setDate(todayIso());
  }, [state.success]);

  return (
    <section
      className="rounded-3xl border border-sky-200 bg-gradient-to-b from-sky-50/80 to-white p-5 sm:p-6"
      aria-labelledby="footfall-capture-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
            Procedencia
          </p>
          <h2 id="footfall-capture-heading" className="mt-1 text-lg font-semibold text-stone-900">
            ¿De dónde nos visitáis?
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">
            Captura en 10–15 s desde móvil o tablet. Pregunta natural en caja y toca las opciones.
            Script: «¿De dónde nos visitáis?» → anotar → «Si quieres, te dejo el WhatsApp / QR».
          </p>
        </div>
        <label className="text-sm text-stone-600">
          <span className="sr-only">Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-900" role="status">
          {state.success}
        </p>
      ) : null}

      <form key={formKey} action={action} className="mt-5 space-y-5">
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="entryType" value={entryType ?? ""} />
        <input type="hidden" name="originGroup" value={originGroup ?? ""} />
        <input type="hidden" name="discoveryChannel" value={channel} />
        <input type="hidden" name="localityDetail" value={locality} />
        <input type="hidden" name="notes" value={notes} />
        <input type="hidden" name="syncDailyStat" value="true" />
        {contactCaptured ? <input type="hidden" name="contactCaptured" value="true" /> : null}

        <div>
          <p className="mb-2 text-sm font-medium text-stone-800">1. Tipo</p>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            {SHOWROOM_FOOTFALL_TYPES.map((t) => (
              <ChoiceButton
                key={t}
                selected={entryType === t}
                onClick={() => setEntryType(t)}
                hint={SHOWROOM_FOOTFALL_TYPE_LABELS[t]}
              >
                {SHOWROOM_FOOTFALL_TYPE_LABELS[t]}
              </ChoiceButton>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-800">2. Procedencia</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWROOM_ORIGIN_GROUPS.filter((g) => g !== "NO_INDICADO").map((g) => (
              <ChoiceButton
                key={g}
                selected={originGroup === g}
                onClick={() => setOriginGroup(g)}
                hint={SHOWROOM_ORIGIN_GROUP_LABELS[g]}
              >
                {SHOWROOM_ORIGIN_GROUP_LABELS[g]}
              </ChoiceButton>
            ))}
            <ChoiceButton
              selected={originGroup === "NO_INDICADO"}
              onClick={() => setOriginGroup("NO_INDICADO")}
              hint="Cuando no se averigua"
            >
              No indicado
            </ChoiceButton>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-800" htmlFor="footfall-locality">
            Localidad (opcional)
          </label>
          <input
            id="footfall-locality"
            type="text"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Ej. Madrid – Las Rozas"
            className="mt-1 w-full max-w-md rounded-xl border border-stone-300 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowChannel((v) => !v)}
            className="text-sm font-medium text-emerald-900 underline underline-offset-2"
          >
            {showChannel ? "Ocultar" : "¿Cómo nos ha conocido?"} (opcional)
          </button>
          {showChannel ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {SHOWROOM_DISCOVERY_CHANNELS.map((c) => (
                <ChoiceButton
                  key={c}
                  selected={channel === c}
                  onClick={() => setChannel(channel === c ? "" : c)}
                  hint={SHOWROOM_DISCOVERY_CHANNEL_LABELS[c]}
                >
                  {SHOWROOM_DISCOVERY_CHANNEL_LABELS[c]}
                </ChoiceButton>
              ))}
            </div>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={contactCaptured}
            onChange={(e) => setContactCaptured(e.target.checked)}
            className="size-4 rounded border-stone-300 accent-emerald-800"
          />
          Contacto captado (WhatsApp / email)
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-800">Nota rápida (opcional)</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || pending}
          className="min-h-12 w-full max-w-xs rounded-full bg-emerald-800 px-6 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Guardando…" : "Guardar registro"}
        </button>
      </form>
    </section>
  );
}

export function ShowroomFootfallRecentList({
  entries,
}: {
  entries: ShowroomFootfallRecord[];
}) {
  const [state, deleteAction, pending] = useActionState(deleteShowroomFootfallAction, initial);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-stone-500">Sin registros de procedencia en el periodo.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      {state.error ? (
        <p className="mb-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mb-2 text-sm text-emerald-800" role="status">
          {state.success}
        </p>
      ) : null}
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Registros recientes de procedencia</caption>
        <thead>
          <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
            <th scope="col" className="py-2 pr-3">
              Fecha
            </th>
            <th scope="col" className="py-2 pr-3">
              Tipo
            </th>
            <th scope="col" className="py-2 pr-3">
              Procedencia
            </th>
            <th scope="col" className="py-2 pr-3">
              Canal
            </th>
            <th scope="col" className="py-2 pr-3">
              Contacto
            </th>
            <th scope="col" className="py-2">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 20).map((e) => (
            <tr key={e.id} className="border-b border-stone-100">
              <td className="py-2 pr-3 tabular-nums">{e.date}</td>
              <td className="py-2 pr-3">{SHOWROOM_FOOTFALL_TYPE_LABELS[e.entryType]}</td>
              <td className="py-2 pr-3">
                {SHOWROOM_ORIGIN_GROUP_LABELS[e.originGroup]}
                {e.localityDetail ? (
                  <span className="block text-xs text-stone-500">{e.localityDetail}</span>
                ) : null}
              </td>
              <td className="py-2 pr-3 text-stone-600">
                {e.discoveryChannel
                  ? SHOWROOM_DISCOVERY_CHANNEL_LABELS[e.discoveryChannel]
                  : "—"}
              </td>
              <td className="py-2 pr-3">{e.contactCaptured ? "Sí" : "—"}</td>
              <td className="py-2">
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="text-xs text-red-700 underline hover:text-red-900 disabled:opacity-50"
                  >
                    Borrar
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
