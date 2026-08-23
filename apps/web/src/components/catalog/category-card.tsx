import Link from "next/link";
import Image from "next/image";
import type { CategoryRecord } from "@culebra/auth";
import { getCategoryImageSrc } from "@/lib/category-images";

export function CategoryCard({ category }: { category: CategoryRecord }) {
  const imageSrc = getCategoryImageSrc(category.slug, category.name);

  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-stone-200">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />
        <h3 className="absolute bottom-3 left-4 right-4 text-lg font-semibold leading-snug text-white drop-shadow-sm">
          {category.name}
        </h3>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {category.description ? (
          <p className="line-clamp-2 text-sm text-stone-600">{category.description}</p>
        ) : null}
        {category.children.length > 0 ? (
          <p className="mt-auto pt-3 text-xs text-stone-500">
            {category.children.length} subcategorías
          </p>
        ) : null}
      </div>
    </Link>
  );
}
