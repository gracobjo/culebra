import { listCategories, listPublicProducts } from "@culebra/auth";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { siteConfig } from "@/lib/site";

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
  title: `Productos | ${siteConfig.shortName}`,
  description: siteConfig.description,
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categories = await listCategories();
  const { items, total } = await listPublicProducts({
    search: params.q,
    categorySlug: params.categoria,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    available: params.disponible === "1",
    limit: 24,
  });

  const activeCategory = params.categoria
    ? categories.find((c) => c.slug === params.categoria) ??
      categories.flatMap((c) => c.children).find((c) => c.slug === params.categoria)
    : null;

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          ...(activeCategory
            ? [{ label: activeCategory.name }]
            : [{ label: "Productos" }]),
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        {activeCategory ? activeCategory.name : "Productos"}
      </h1>
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

      <p className="mt-6 text-sm text-stone-500">
        {total} producto{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Sin resultados"
            description="Prueba otros filtros o explora todas las categorias."
            actionHref="/categorias"
            actionLabel="Ver categorias"
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
