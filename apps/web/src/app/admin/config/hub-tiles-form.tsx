"use client";

import { useActionState } from "react";
import type { HomeHubTileRecord } from "@culebra/auth";
import {
  deleteHomeHubTileAction,
  seedHomeHubTilesAction,
  upsertHomeHubTileAction,
  type SiteConfigAdminState,
} from "./actions";

const initial: SiteConfigAdminState = {};

function TileForm({
  tile,
}: {
  tile?: HomeHubTileRecord;
}) {
  const [state, action, pending] = useActionState(upsertHomeHubTileAction, initial);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      {tile ? <input type="hidden" name="id" value={tile.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs">
          Título
          <input
            name="title"
            required
            defaultValue={tile?.title ?? ""}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs">
          Slug
          <input
            name="slug"
            required
            defaultValue={tile?.slug ?? ""}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          Enlace (href)
          <input
            name="href"
            required
            defaultValue={tile?.href ?? "/"}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          Descripción
          <textarea
            name="description"
            required
            rows={2}
            defaultValue={tile?.description ?? ""}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          Imagen (ruta pública)
          <input
            name="imageUrl"
            required
            defaultValue={tile?.imageUrl ?? "/categories/miel-y-productos-apicolas.png"}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          Texto alternativo (lectores de pantalla)
          <input
            name="altText"
            required
            defaultValue={tile?.altText ?? ""}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          Mensaje al pasar el ratón
          <input
            name="hintText"
            required
            defaultValue={tile?.hintText ?? ""}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
        <label className="block text-xs">
          Estilo
          <select name="tone" defaultValue={tile?.tone ?? "agro"} className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm">
            <option value="agro">Agroalimentario</option>
            <option value="territory">Territorio</option>
          </select>
        </label>
        <label className="block text-xs">
          Orden
          <input
            name="sortOrder"
            type="number"
            defaultValue={tile?.sortOrder ?? 10}
            className="mt-1 min-h-10 w-full rounded-xl border px-3 text-sm"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={tile?.isActive ?? true} />
        Visible en inicio
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : tile ? "Actualizar bloque" : "Crear bloque"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}

export function HomeHubTilesCrud({ tiles }: { tiles: HomeHubTileRecord[] }) {
  const [seedState, seedAction, seedPending] = useActionState(seedHomeHubTilesAction, initial);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard de inicio (bloques / divs)</h2>
        <p className="mt-1 text-sm text-stone-600">
          CRUD de las tarjetas de «Tienda de la comarca»: título, foto, texto alternativo y
          mensaje al pasar el ratón. El orden define la parrilla de la home.
        </p>
      </div>
      <form action={seedAction}>
        <button
          type="submit"
          disabled={seedPending}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm disabled:opacity-60"
        >
          {seedPending ? "Sembrando…" : "Cargar bloques por defecto"}
        </button>
        {seedState.error ? <p className="mt-2 text-sm text-red-700">{seedState.error}</p> : null}
        {seedState.success ? <p className="mt-2 text-sm text-emerald-800">{seedState.success}</p> : null}
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {tiles.map((tile) => (
          <div key={tile.id} className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-stone-200">
              {/* preview del div público */}
              <div className="relative h-28 bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tile.imageUrl} alt={tile.altText} className="h-full w-full object-cover" />
              </div>
              <p className="px-3 py-2 text-sm font-medium">{tile.title}</p>
            </div>
            <TileForm tile={tile} />
            {!tile.id.startsWith("default-") ? (
              <form action={deleteHomeHubTileAction}>
                <input type="hidden" name="id" value={tile.id} />
                <button type="submit" className="text-sm text-red-800 underline">
                  Eliminar bloque
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">Nuevo bloque</h3>
        <div className="mt-3">
          <TileForm />
        </div>
      </div>
    </section>
  );
}
