import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { siteConfig } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Categoria no encontrada" };
  }
  return {
    title: `${category.name} | ${siteConfig.shortName}`,
    description: category.description ?? `Productos de ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { items, total } = await listPublicProducts({
    categorySlug: slug,
    limit: 24,
  });

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.name },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-stone-600">{category.description}</p>
      ) : null}

      {category.children.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categorias/${child.slug}`}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm hover:border-emerald-400"
            >
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-stone-500">
        {total} producto{total === 1 ? "" : "s"}
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Categoria sin productos"
            description="Vuelve mas tarde o explora otras categorias."
            actionHref="/productos"
            actionLabel="Ver todo el catalogo"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
