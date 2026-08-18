import Link from "next/link";
import { listCategories } from "@culebra/auth";
import { CategoryCard } from "@/components/catalog/category-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: `Categorias | ${siteConfig.shortName}`,
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Categorias" }]} />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Categorias</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Navega por embutidos, quesos, vinos, miel y mas productos del territorio.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id}>
            <CategoryCard category={category} />
            {category.children.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categorias/${child.slug}`}
                      className="rounded-full border border-stone-200 px-3 py-1 text-stone-600 hover:border-emerald-300"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
