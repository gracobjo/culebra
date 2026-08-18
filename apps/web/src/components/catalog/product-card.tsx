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

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:border-emerald-300"
    >
      <div className="flex h-40 items-center justify-center bg-stone-100 text-sm text-stone-500">
        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          "Sin imagen"
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wide text-emerald-800">
          {product.category?.name}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
        <p className="mt-1 text-sm text-stone-600">{product.vendor?.tradeName}</p>
        {location ? <p className="text-xs text-stone-500">{location}</p> : null}
        <p className="mt-4 text-lg font-medium text-emerald-900">
          {formatPrice(product.basePrice)}
        </p>
        {product.stock <= 0 ? (
          <p className="mt-1 text-xs text-stone-500">Agotado</p>
        ) : null}
      </div>
    </Link>
  );
}
