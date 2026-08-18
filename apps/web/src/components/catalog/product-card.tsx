import Link from "next/link";
import type { ProductRecord } from "@culebra/auth";
import { formatPrice } from "@/lib/format";

type ProductCardProps = {
  product: ProductRecord;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const location = [product.vendor?.city, product.vendor?.province]
    .filter(Boolean)
    .join(", ");
  const hasDiscount =
    product.previousPrice && Number(product.previousPrice) > Number(product.basePrice);
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-stone-100 text-sm text-stone-500">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          "Sin imagen"
        )}
        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-stone-800/90 px-2.5 py-1 text-xs font-medium text-white">
            Agotado
          </span>
        ) : null}
        {hasDiscount && !soldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-600 px-2.5 py-1 text-xs font-medium text-white">
            Oferta
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wide text-emerald-800">
          {product.category?.name}
        </p>
        <h2 className="mt-1 line-clamp-2 text-lg font-semibold group-hover:text-emerald-900">
          {product.name}
        </h2>
        <p className="mt-1 text-sm text-stone-600">{product.vendor?.tradeName}</p>
        {location ? <p className="text-xs text-stone-500">{location}</p> : null}
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-lg font-medium text-emerald-900">
            {formatPrice(product.basePrice)}
          </p>
          {hasDiscount ? (
            <p className="text-sm text-stone-500 line-through">
              {formatPrice(product.previousPrice!)}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
