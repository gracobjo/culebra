import Link from "next/link";
import { listCategories } from "@culebra/auth";
import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Categorias | Sierra de la Culebra Marketplace",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <PageShell>
      <h1 className="text-3xl font-semibold sm:text-4xl">Categorias</h1>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              <Link href={`/categorias/${category.slug}`}>{category.name}</Link>
            </h2>
            {category.children.length > 0 ? (
              <ul className="mt-4 space-y-1 text-sm text-stone-600">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link href={`/categorias/${child.slug}`}>{child.name}</Link>
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
