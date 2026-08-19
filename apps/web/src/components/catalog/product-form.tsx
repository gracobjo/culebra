"use client";

import { useActionState, useMemo, useState } from "react";
import type { CategoryRecord, ProductRecord } from "@culebra/auth";
import {
  createProductAction,
  disableProductAction,
  submitProductAction,
  updateCommercialAction,
  updateProductAction,
  type ProductFormState,
} from "@/app/panel/proveedor/productos/actions";
import { ImageUploader } from "@/components/catalog/image-uploader";

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  "embutidos-y-productos-carnicos": "/categories/embutidos-y-productos-carnicos.png",
  "jamon": "/categories/embutidos-y-productos-carnicos.png",
  "chorizo": "/categories/embutidos-y-productos-carnicos.png",
  "quesos-y-lacteos": "/categories/quesos-y-lacteos.png",
  "miel-y-productos-apicolas": "/categories/miel-y-productos-apicolas.png",
  "vinos": "/categories/vinos.png",
  "licores": "/categories/licores.png",
};

function getPlaceholderFromSelection(params: {
  categoryName?: string;
  categorySlug?: string;
  subcategorySlug?: string;
}): string {
  const name = (params.categoryName ?? "").toLowerCase();
  if (name.includes("repost")) return "/categories/reposteria.png";

  const slug = params.subcategorySlug ?? params.categorySlug ?? "";
  return CATEGORY_PLACEHOLDER[slug] ?? "/categories/productos-tradicionales.png";
}

const initialState: ProductFormState = {};

type ProductFormProps = {
  categories: CategoryRecord[];
  product?: ProductRecord;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    product?.categoryId ?? "",
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    product?.subcategoryId ?? "",
  );
  const [basePrice, setBasePrice] = useState<string>(
    product?.basePrice !== undefined ? String(product.basePrice) : "",
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const selectedSubcategory = useMemo(() => {
    if (!selectedSubcategoryId) return undefined;
    for (const cat of categories) {
      const child = cat.children.find((ch) => ch.id === selectedSubcategoryId);
      if (child) return child;
    }
    return undefined;
  }, [categories, selectedSubcategoryId]);

  const placeholderUrl = getPlaceholderFromSelection({
    categoryName: selectedCategory?.name,
    categorySlug: selectedCategory?.slug,
    subcategorySlug: selectedSubcategory?.slug,
  });

  const canEditDetails =
    !product ||
    ["DRAFT", "REJECTED", "PENDING_REVIEW", "PUBLISHED"].includes(
      product.status,
    );
  const canEditCommercial = Boolean(product);
  const action = product
    ? canEditDetails
      ? updateProductAction.bind(null, product.id)
      : updateCommercialAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const editable = canEditDetails;
  const canEditPriceOrStock = editable || canEditCommercial;

  const variantDefaults = product?.variants ?? [];

  return (
    <div className="space-y-6">
      {product && !canEditDetails ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Este producto no esta en un estado editable por el proveedor. Puedes actualizar el
          PVP y el stock.
        </p>
      ) : null}
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
              value={selectedCategoryId}
              disabled={!editable}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedSubcategoryId("");
              }}
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
              value={selectedSubcategoryId}
              disabled={!editable}
              onChange={(e) => setSelectedSubcategoryId(e.target.value)}
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
              PVP EUR *
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0.01"
              step="0.01"
              required={editable}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              disabled={(product?.variants.length ?? 0) > 0 || !canEditPriceOrStock}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
            />
            {(product?.variants.length ?? 0) > 0 ? (
              <input type="hidden" name="basePrice" value={basePrice} />
            ) : null}
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
              disabled={(product?.variants.length ?? 0) > 0 || !canEditPriceOrStock}
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
          <label className="mb-2 block text-sm font-medium">
            Foto del producto
          </label>
          <ImageUploader
            currentUrl={product?.images[0]?.url ?? ""}
            placeholderUrl={placeholderUrl}
            inputName="imageUrl"
            disabled={!editable}
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
                placeholder="PVP"
                defaultValue={variantDefaults[index]?.price ?? ""}
                disabled={!canEditPriceOrStock}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
              />
              <input
                name={`variantStock${index + 1}`}
                type="number"
                min="0"
                placeholder="Stock"
                defaultValue={variantDefaults[index]?.stock ?? ""}
                disabled={!canEditPriceOrStock}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 disabled:bg-stone-100"
              />
            </div>
          ))}
        </fieldset>

        {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

        {editable || canEditCommercial ? (
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {pending
              ? "Guardando..."
              : product
                ? canEditDetails
                  ? "Guardar cambios"
                  : "Actualizar PVP y stock"
                : "Crear producto"}
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
