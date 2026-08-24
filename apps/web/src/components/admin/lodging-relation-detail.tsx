"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  addLodgingEventAction,
  updateLodgingRelationAction,
  type TourismAdminState,
} from "@/app/admin/turismo/actions";
import {
  AGREEMENT_GENERAL_CONDITIONS,
  AGREEMENT_MODALITIES,
  AGREEMENT_WE_OFFER,
  EVENT_TYPE_LABELS,
  MODALITY_LABELS,
  STATUS_LABELS,
} from "@/lib/alojamientos-contraprestaciones";
import type {
  LodgingOfferContactsRecord,
  LodgingRelationEventRecord,
  LodgingRelationRecord,
} from "@culebra/auth";

const initial: TourismAdminState = {};

function contactOrIndicate(value: string | null | undefined) {
  return value?.trim() ? value : "[indicar]";
}

export function LodgingRelationDetail({
  relation,
  contacts,
  accommodations,
}: {
  relation: LodgingRelationRecord & { events: LodgingRelationEventRecord[] };
  contacts: LodgingOfferContactsRecord;
  accommodations: Array<{ id: string; name: string }>;
}) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateLodgingRelationAction,
    initial,
  );
  const [eventState, eventAction, eventPending] = useActionState(addLodgingEventAction, initial);

  const selected = new Set(relation.modalities);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/turismo" className="text-sm text-emerald-800 underline">
          ← Volver a Turismo
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium print:hidden"
        >
          Imprimir / PDF ficha
        </button>
      </div>

      <div className="grid gap-6 print:hidden lg:grid-cols-2">
        <form action={updateAction} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
          <input type="hidden" name="id" value={relation.id} />
          <h3 className="font-semibold">Editar relación</h3>
          <input
            name="name"
            required
            defaultValue={relation.name}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="contactPerson"
              defaultValue={relation.contactPerson ?? ""}
              placeholder="Persona de contacto"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="city"
              defaultValue={relation.city ?? ""}
              placeholder="Localidad"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="whatsapp"
              defaultValue={relation.whatsapp ?? ""}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              defaultValue={relation.phone ?? ""}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="email"
              defaultValue={relation.email ?? ""}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="referralThreshold"
              type="number"
              min={3}
              max={30}
              defaultValue={relation.referralThreshold}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="welcomeSpecialPrice"
              type="number"
              step="0.01"
              defaultValue={relation.welcomeSpecialPrice ?? "23"}
              placeholder="Precio especial Escapada"
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <select
              name="welcomeMode"
              defaultValue={relation.welcomeMode ?? ""}
              className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
            >
              <option value="">Modo bienvenida…</option>
              <option value="SPECIAL_PRICE">Precio especial (ellos compran)</option>
              <option value="CONSIGNMENT">Consignación (2–4 cestas)</option>
            </select>
          </div>
          <select
            name="status"
            defaultValue={relation.status}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            name="accommodationId"
            defaultValue={relation.accommodationId ?? ""}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          >
            <option value="">Sin vincular al directorio</option>
            {accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            name="collabLevel"
            defaultValue={String(relation.collabLevel)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Nivel operativo {n}
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
                    defaultChecked={selected.has(value as never)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="materialPlaced" defaultChecked={Boolean(relation.materialPlacedAt)} />
            Material puesto
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="agreementAccepted"
              defaultChecked={Boolean(relation.agreementAcceptedAt)}
            />
            Colaboración aceptada (marca acuerdo)
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={relation.notes ?? ""}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={updatePending}
            className="rounded-full bg-teal-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {updatePending ? "Guardando…" : "Guardar cambios"}
          </button>
          {updateState.error ? <p className="text-sm text-red-700">{updateState.error}</p> : null}
          {updateState.success ? (
            <p className="text-sm text-emerald-700">{updateState.success}</p>
          ) : null}
        </form>

        <div className="space-y-4">
          <form action={eventAction} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-5">
            <input type="hidden" name="relationId" value={relation.id} />
            <h3 className="font-semibold">Registrar evento</h3>
            <select
              name="type"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              defaultValue="REFERRAL"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              />
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Importe € (opcional)"
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <input
              name="note"
              placeholder="Nota"
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={eventPending}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {eventPending ? "Registrando…" : "Añadir evento"}
            </button>
            {eventState.error ? <p className="text-sm text-red-700">{eventState.error}</p> : null}
            {eventState.success ? (
              <p className="text-sm text-emerald-700">{eventState.success}</p>
            ) : null}
          </form>

          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">Contadores</h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-stone-500">Referidos</dt>
                <dd className="font-semibold">{relation.referredClientsCount}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Cestas vía canal</dt>
                <dd className="font-semibold">{relation.basketsViaCount}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Detalles enviados</dt>
                <dd className="font-semibold">{relation.thankYouGiftsSent}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Detalles pendientes</dt>
                <dd className="font-semibold text-amber-800">{relation.giftsDue}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Pedidos online atrib.</dt>
                <dd className="font-semibold">{relation.onlineOrdersAttributed}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Umbral detalle</dt>
                <dd className="font-semibold">cada {relation.referralThreshold}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h3 className="font-semibold">Historial</h3>
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
              {relation.events.length === 0 ? (
                <li className="text-stone-500">Sin eventos todavía.</li>
              ) : (
                relation.events.map((ev) => (
                  <li key={ev.id} className="rounded-xl border border-stone-100 px-3 py-2">
                    <p className="font-medium">
                      {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                      {ev.quantity && ev.quantity > 1 ? ` ×${ev.quantity}` : ""}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(ev.occurredAt).toLocaleString("es-ES")}
                      {ev.note ? ` · ${ev.note}` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>

      {/* Ficha imprimible */}
      <article className="rounded-3xl border border-stone-300 bg-white p-6 text-stone-900 print:border-0 print:p-0 sm:p-8">
        <header className="border-b border-stone-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Sabores de la Culebra
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Propuesta de colaboración</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Objetivo: ofrecer a vuestros huéspedes una experiencia local auténtica (productos de
            la Sierra de la Culebra) y generar una colaboración sencilla y beneficiosa para ambas
            partes.
          </p>
        </header>

        <section className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Modalidades de colaboración</h3>
          {AGREEMENT_MODALITIES.map((mod, idx) => (
            <div key={mod.id}>
              <p className="font-medium">
                {idx + 1}. {mod.title}
                {selected.has(mod.id) ? (
                  <span className="ml-2 text-xs font-normal text-emerald-800">(elegida)</span>
                ) : null}
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-700">
                {mod.body}
              </pre>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold">Condiciones generales</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {AGREEMENT_GENERAL_CONDITIONS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold">Qué ofrecemos</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {AGREEMENT_WE_OFFER.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 text-sm">
          <h3 className="text-lg font-semibold">Datos de contacto</h3>
          <p className="mt-2 font-medium">Sabores de la Culebra</p>
          <p>Showroom: {contactOrIndicate(contacts.showroomAddress)}</p>
          <p>WhatsApp / teléfono: {contactOrIndicate(contacts.whatsapp || contacts.phone)}</p>
          <p>Email: {contactOrIndicate(contacts.email)}</p>
          <p>Web: {contactOrIndicate(contacts.websiteUrl)}</p>
          <p>Persona de contacto: {contactOrIndicate(contacts.contactPerson)}</p>
        </section>

        <section className="mt-8 border-t border-stone-200 pt-6 text-sm">
          <h3 className="text-lg font-semibold">Aceptación de la colaboración</h3>
          <div className="mt-4 space-y-2">
            <p>
              Alojamiento:{" "}
              <span className="font-medium underline decoration-dotted">{relation.name}</span>
            </p>
            <p>
              Persona de contacto:{" "}
              <span className="underline decoration-dotted">
                {relation.contactPerson || "______________________________"}
              </span>
            </p>
            <p>
              Teléfono / WhatsApp:{" "}
              <span className="underline decoration-dotted">
                {relation.whatsapp || relation.phone || "_____________________________"}
              </span>
            </p>
          </div>
          <p className="mt-4 font-medium">Modalidad elegida:</p>
          <ul className="mt-2 space-y-1">
            {AGREEMENT_MODALITIES.map((mod) => (
              <li key={mod.id}>
                {selected.has(mod.id) ? "☑" : "☐"} {mod.title}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <p>
              Fecha:{" "}
              {relation.agreementAcceptedAt
                ? new Date(relation.agreementAcceptedAt).toLocaleDateString("es-ES")
                : "_______________"}
            </p>
            <p>Firma: _______________________________</p>
          </div>
        </section>
      </article>
    </div>
  );
}
