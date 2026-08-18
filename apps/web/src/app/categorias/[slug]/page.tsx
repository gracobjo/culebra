import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";

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
    title: `${category.name} | Sierra de la Culebra Marketplace`,
    description: category.description ?? `Productos de ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { items } = await listPublicProducts({
    categorySlug: slug,
    limit: 24,
  });

  return (
    <PageShell>
      <Link href="/productos" className="text-sm text-emerald-800">
        ← Volver al catalogo
      </Link>
      <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-stone-600">{category.description}</p>
      ) : null}

      {category.children.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categorias/${child.slug}`}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm"
            >
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-600">
          Todavia no hay productos publicados en esta categoria.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
