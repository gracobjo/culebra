import type { CategoryRecord } from "@culebra/auth";

type CatalogFiltersProps = {
  categories: CategoryRecord[];
  current: {
    search?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    available?: string;
  };
};

export function CatalogFilters({ categories, current }: CatalogFiltersProps) {
  return (
    <form method="get" className="grid gap-3 rounded-3xl border border-stone-200 bg-white p-4 sm:p-5 md:grid-cols-5 md:gap-4">
      <input
        name="q"
        defaultValue={current.search}
        placeholder="Buscar producto, productor o localidad"
        className="min-h-11 rounded-xl border border-stone-300 px-4 py-3 md:col-span-2"
      />
      <select
        name="categoria"
        defaultValue={current.categorySlug ?? ""}
        className="min-h-11 rounded-xl border border-stone-300 px-4 py-3"
      >
        <option value="">Todas las categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        name="min"
        type="number"
        min="0"
        step="0.01"
        defaultValue={current.minPrice}
        placeholder="Precio min"
        className="min-h-11 rounded-xl border border-stone-300 px-4 py-3"
      />
      <input
        name="max"
        type="number"
        min="0"
        step="0.01"
        defaultValue={current.maxPrice}
        placeholder="Precio max"
        className="min-h-11 rounded-xl border border-stone-300 px-4 py-3"
      />
      <label className="flex min-h-11 items-center gap-2 text-sm text-stone-700 md:col-span-3">
        <input
          type="checkbox"
          name="disponible"
          value="1"
          className="h-5 w-5"
          defaultChecked={current.available === "1"}
        />
        Solo disponibles
      </label>
      <button
        type="submit"
        className="min-h-11 rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white md:col-span-2"
      >
        Filtrar
      </button>
    </form>
  );
}
