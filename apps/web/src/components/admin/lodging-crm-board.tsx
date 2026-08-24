"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createLodgingRelationAction,
  saveLodgingOfferContactsAction,
  type TourismAdminState,
} from "@/app/admin/turismo/actions";
import {
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/lib/alojamientos-contraprestaciones";
import type { LodgingCrmSummary, LodgingOfferContactsRecord, LodgingRelationRecord } from "@culebra/auth";

const initial: TourismAdminState = {};

export function LodgingCrmBoard({
  relations,
  summary,
  accommodations,
  contacts,
}: {
  relations: LodgingRelationRecord[];
  summary: LodgingCrmSummary;
  accommodations: Array<{ id: string; name: string }>;
  contacts: LodgingOfferContactsRecord;
}) {
  const [createState, createAction, createPending] = useActionState(
    createLodgingRelationAction,
    initial,
  );
  const [contactState, contactAction, contactPending] = useActionState(
    saveLodgingOfferContactsAction,
    initial,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-teal-200 bg-teal-50/40 p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-teal-800">CRM hosteleros</p>
        <h2 className="mt-1 text-xl font-semibold text-teal-950">
          Relaciones con alojamientos (persistido)
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-teal-950/80">
          Registro de cada colaboración: estado, modalidades, referidos, cestas, detalles
          debidos y aceptación de la ficha. Historial y ficha imprimible en la ficha de cada
          alojamiento.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Relaciones", value: summary.total },
            { label: "Activos", value: summary.active },
            { label: "Con material", value: summary.withMaterial },
            { label: "Acuerdos aceptados", value: summary.agreements },
            { label: "Clientes referidos", value: summary.referredClients },
            { label: "Cestas vía canal", value: summary.basketsVia },
            { label: "Detalles pendientes", value: summary.giftsDue },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-teal-200/80 bg-white px-3 py-2.5"
            >
              <p className="text-xs text-stone-500">{card.label}</p>
              <p className="text-2xl font-semibold tabular-nums text-teal-950">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={createAction} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Nueva relación</h3>
          <input
            name="name"
            required
            placeholder="Nombre del alojamiento"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="contactPerson"
              placeholder="Persona de contacto"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="city"
              placeholder="Localidad"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="whatsapp"
              placeholder="WhatsApp"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              placeholder="Teléfono"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="distanceMinutes"
              type="number"
              min={0}
              placeholder="Minutos a Villardeciervos"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <select
            name="accommodationId"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Sin vincular al directorio</option>
            {accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            defaultValue="PROSPECT"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <fieldset className="rounded-2xl border border-stone-100 p-3">
            <legend className="px-1 text-xs font-medium text-stone-500">Modalidades</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {Object.entries(MODALITY_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="modalities"
                    value={value}
                    defaultChecked={value === "PRESENCE_RECOMMEND"}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="materialPlaced" />
            Material ya dejado
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Notas internas"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createPending}
            className="rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createPending ? "Guardando…" : "Crear relación"}
          </button>
          {createState.error ? (
            <p className="text-sm text-red-700">{createState.error}</p>
          ) : null}
          {createState.success ? (
            <p className="text-sm text-emerald-700">{createState.success}</p>
          ) : null}
        </form>

        <form action={contactAction} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold">Contacto Sabores (fichas)</h3>
          <p className="text-xs text-stone-500">
            Placeholders editables para la propuesta de colaboración imprimible. Vacío = [indicar].
          </p>
          <input
            name="contactPerson"
            defaultValue={contacts.contactPerson ?? ""}
            placeholder="Persona de contacto"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            name="whatsapp"
            defaultValue={contacts.whatsapp ?? ""}
            placeholder="WhatsApp"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            defaultValue={contacts.phone ?? ""}
            placeholder="Teléfono"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            name="email"
            defaultValue={contacts.email ?? ""}
            placeholder="Email"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            name="websiteUrl"
            defaultValue={contacts.websiteUrl ?? ""}
            placeholder="Web"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            name="showroomAddress"
            defaultValue={contacts.showroomAddress ?? "Villardeciervos (Zamora)"}
            placeholder="Dirección showroom"
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={contactPending}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {contactPending ? "Guardando…" : "Guardar contacto fichas"}
          </button>
          {contactState.error ? (
            <p className="text-sm text-red-700">{contactState.error}</p>
          ) : null}
          {contactState.success ? (
            <p className="text-sm text-emerald-700">{contactState.success}</p>
          ) : null}
        </form>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white">
        <h3 className="border-b border-stone-100 px-5 py-4 font-semibold">Cartera de relaciones</h3>
        {relations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-stone-500">
            Aún no hay relaciones. Crea la primera arriba (listado prioritario del plan 90 días).
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {relations.map((rel) => (
              <li
                key={rel.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-stone-900">{rel.name}</p>
                  <p className="text-sm text-stone-500">
                    {STATUS_LABELS[rel.status] ?? rel.status}
                    {rel.city ? ` · ${rel.city}` : ""}
                    {rel.contactPerson ? ` · ${rel.contactPerson}` : ""}
                    {" · "}
                    referidos {rel.referredClientsCount} · cestas {rel.basketsViaCount}
                    {rel.giftsDue > 0 ? (
                      <span className="text-amber-700"> · {rel.giftsDue} detalle(s) pendiente(s)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {(rel.modalities.length
                      ? rel.modalities
                      : rel.primaryModality
                        ? [rel.primaryModality]
                        : []
                    )
                      .map((m) => MODALITY_LABELS[m] ?? m)
                      .join(" · ") || "Sin modalidad"}
                  </p>
                </div>
                <Link
                  href={`/admin/turismo/relaciones/${rel.id}`}
                  className="rounded-full border border-teal-800 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-teal-50"
                >
                  Ficha / historial
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
