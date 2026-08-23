import Link from "next/link";
import Image from "next/image";
import type { CategoryRecord } from "@culebra/auth";
import { getCategoryImageSrc } from "@/lib/category-images";

export function CategoryCard({ category }: { category: CategoryRecord }) {
  const imageSrc = getCategoryImageSrc(category.slug, category.name);

  return (
    <Link href={`/categorias/${category.slug}`} className="shop-card group">
      <div className="relative aspect-[5/3.2] overflow-hidden bg-stone-200">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f241c]/70 via-[#0f241c]/12 to-transparent" />
        <h3 className="absolute bottom-3.5 left-4 right-4 text-lg font-semibold leading-snug tracking-tight text-white drop-shadow-sm">
          {category.name}
        </h3>
      </div>
      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
        {category.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
            {category.description}
          </p>
        ) : null}
        {category.children.length > 0 ? (
          <p className="mt-auto pt-3 text-xs tracking-wide text-stone-500">
            {category.children.length} subcategorías
          </p>
        ) : null}
      </div>
    </Link>
  );
}
