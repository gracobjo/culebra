import Link from "next/link";
import { listCategories, listPublicProducts } from "@culebra/auth";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { ProductCard } from "@/components/catalog/product-card";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    min?: string;
    max?: string;
    disponible?: string;
  }>;
};

export const metadata = {
  title: "Productos | Sierra de la Culebra Marketplace",
  description: "Catalogo de productos locales de la Sierra de la Culebra.",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await listCategories();
  const { items } = await listPublicProducts({
    search: params.q,
    categorySlug: params.categoria,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    available: params.disponible === "1",
    limit: 24,
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">Catalogo</p>
      <h1 className="mt-2 text-4xl font-semibold">Productos</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Compra directamente a productores de la Sierra de la Culebra. La
        informacion de origen o certificacion solo aparece si el productor la
        ha proporcionado.
      </p>

      <div className="mt-8">
        <CatalogFilters
          categories={categories}
          current={{
            search: params.q,
            categorySlug: params.categoria,
            minPrice: params.min,
            maxPrice: params.max,
            available: params.disponible,
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-600">
          No hay productos publicados con esos filtros.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Link href="/" className="mt-10 inline-block text-sm text-emerald-800">
        Volver al inicio
      </Link>
    </main>
  );
}
