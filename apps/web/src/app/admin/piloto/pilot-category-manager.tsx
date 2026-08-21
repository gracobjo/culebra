"use client";

import { useState, useTransition } from "react";
import {
  createPilotCategory,
  deletePilotCategory,
  updatePilotCategory,
} from "./actions";

export type PilotCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
};

type PilotCategoryManagerProps = {
  categories: PilotCategoryRow[];
};

export function PilotCategoryManager({ categories }: PilotCategoryManagerProps) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Categorías del programa piloto
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Persistentes en base de datos. Incluyen agroalimentario y hostelería /
            turismo. Si una categoría está en uso, al borrar se desactiva (soft-delete).
          </p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_5rem_6rem_auto]"
        action={(fd) => {
          startTransition(async () => {
            await createPilotCategory(fd);
          });
        }}
      >
        <input
          name="name"
          required
          placeholder="Nueva categoría (ej. Panaderías)"
          className="rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <input
          name="icon"
          placeholder="🍽️"
          maxLength={8}
          className="rounded-xl border border-stone-300 px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title="Emoji opcional"
        />
        <input
          name="sortOrder"
          type="number"
          placeholder="Orden"
          className="rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button type="submit" disabled={pending} className="btn btn-primary text-sm">
          {pending ? "…" : "Añadir"}
        </button>
      </form>

      <ul className="mt-5 divide-y divide-stone-100">
        {categories.length === 0 ? (
          <li className="py-6 text-center text-sm text-stone-400">
            No hay categorías. Añade la primera arriba.
          </li>
        ) : (
          categories.map((cat) => (
            <li key={cat.id} className="py-3">
              {editingId === cat.id ? (
                <form
                  className="grid gap-2 sm:grid-cols-[1fr_5rem_6rem_auto_auto]"
                  action={(fd) => {
                    startTransition(async () => {
                      await updatePilotCategory(fd);
                      setEditingId(null);
                    });
                  }}
                >
                  <input type="hidden" name="id" value={cat.id} />
                  <input
                    name="name"
                    defaultValue={cat.name}
                    required
                    className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  />
                  <input
                    name="icon"
                    defaultValue={cat.icon ?? ""}
                    maxLength={8}
                    className="rounded-xl border border-stone-300 px-3 py-2 text-center text-sm"
                  />
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={cat.sortOrder}
                    className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  />
                  <select
                    name="isActive"
                    defaultValue={cat.isActive ? "true" : "false"}
                    className="rounded-xl border border-stone-300 px-2 py-2 text-sm"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" disabled={pending} className="btn btn-primary text-sm">
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800">
                      <span className="mr-2">{cat.icon ?? "🌿"}</span>
                      {cat.name}
                      {!cat.isActive ? (
                        <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                          Inactiva
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-stone-400">
                      {cat.slug} · orden {cat.sortOrder}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(cat.id)}
                      className="btn btn-secondary text-sm"
                    >
                      Editar
                    </button>
                    <form
                      action={(fd) => {
                        startTransition(async () => {
                          await deletePilotCategory(fd);
                        });
                      }}
                    >
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        disabled={pending}
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Borrar
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
