import Link from "next/link";
import type { CategoryRecord } from "@culebra/auth";

export function CategoryCard({ category }: { category: CategoryRecord }) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex min-w-0 flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold leading-snug group-hover:text-emerald-900">{category.name}</h3>
      {category.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-stone-600">{category.description}</p>
      ) : null}
      {category.children.length > 0 ? (
        <p className="mt-4 text-xs text-stone-500">
          {category.children.length} subcategorias
        </p>
      ) : null}
    </Link>
  );
}
