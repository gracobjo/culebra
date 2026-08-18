"use client";

import { useActionState } from "react";
import type { CategoryRecord, ProductRecord } from "@culebra/auth";
import {
  createProductAction,
  disableProductAction,
  submitProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/panel/proveedor/productos/actions";

const initialState: ProductFormState = {};

type ProductFormProps = {
  categories: CategoryRecord[];
  product?: ProductRecord;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const editable =
    !product || ["DRAFT", "REJECTED"].includes(product.status);

  const variantDefaults = product?.variants ?? [];

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="name">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="categoryId">
              Categoria *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            >
              <option value="">Selecciona categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="subcategoryId">
              Subcategoria
            </label>
            <select
              id="subcategoryId"
              name="subcategoryId"
              defaultValue={product?.subcategoryId ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            >
              <option value="">Sin subcategoria</option>
              {categories.flatMap((category) =>
                category.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {category.name} / {child.name}
                  </option>
                )),
              )}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="shortDescription">
            Descripcion corta
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            rows={2}
            defaultValue={product?.shortDescription ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="longDescription">
            Descripcion larga
          </label>
          <textarea
            id="longDescription"
            name="longDescription"
            rows={5}
            defaultValue={product?.longDescription ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="basePrice">
              Precio EUR *
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={product?.basePrice}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="vatRate">
              IVA %
            </label>
            <input
              id="vatRate"
              name="vatRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.vatRate ?? "10"}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product && product.variants.length === 0 ? product.stock : 0}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="unit">
              Unidad
            </label>
            <input
              id="unit"
              name="unit"
              defaultValue={product?.unit ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="weight">
              Peso (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              min="0"
              step="0.001"
              defaultValue={product?.weight ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              disabled={!editable}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="origin">
            Origen (solo si puedes documentarlo)
          </label>
          <input
            id="origin"
            name="origin"
            defaultValue={product?.origin ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="ingredients">
            Ingredientes
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={3}
            defaultValue={product?.ingredients ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="allergens">
            Alergenos
          </label>
          <textarea
            id="allergens"
            name="allergens"
            rows={2}
            defaultValue={product?.allergens ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="conservation">
            Conservacion
          </label>
          <textarea
            id="conservation"
            name="conservation"
            rows={2}
            defaultValue={product?.conservation ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="imageUrl">
            URL de imagen
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            defaultValue={product?.images[0]?.url ?? ""}
            disabled={!editable}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
          />
        </div>

        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-2 text-sm font-medium">Variantes (opcional)</legend>
          <p className="mb-3 text-xs text-stone-500">
            Ejemplo: 250 g, 500 g, 1 kg. Si las usas, el stock se controla por variante.
          </p>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-3 grid gap-3 sm:grid-cols-3">
              <input
                name={`variantLabel${index + 1}`}
                placeholder="Etiqueta"
                defaultValue={variantDefaults[index]?.label ?? ""}
                disabled={!editable}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
              />
              <input
                name={`variantPrice${index + 1}`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Precio"
                defaultValue={variantDefaults[index]?.price ?? ""}
                disabled={!editable}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
              />
              <input
                name={`variantStock${index + 1}`}
                type="number"
                min="0"
                placeholder="Stock"
                defaultValue={variantDefaults[index]?.stock ?? ""}
                disabled={!editable}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
              />
            </div>
          ))}
        </fieldset>

        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

        {editable ? (
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"}
          </button>
        ) : null}
      </form>

      {product && (product.status === "DRAFT" || product.status === "REJECTED") ? (
        <form action={submitProductAction.bind(null, product.id)}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-full border border-emerald-800 px-5 py-3 text-sm font-medium text-emerald-800 sm:w-auto"
          >
            Enviar a revision
          </button>
        </form>
      ) : null}

      {product && product.status === "PUBLISHED" ? (
        <form action={disableProductAction.bind(null, product.id)}>
          <button
            type="submit"
            className="min-h-11 w-full rounded-full border border-stone-400 px-5 py-3 text-sm font-medium sm:w-auto"
          >
            Desactivar producto
          </button>
        </form>
      ) : null}
    </div>
  );
}
