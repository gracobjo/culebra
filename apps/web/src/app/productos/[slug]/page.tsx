import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@culebra/auth";
import { formatPrice } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) {
    return { title: "Producto no encontrado" };
  }
  return {
    title: `${product.name} | Sierra de la Culebra Marketplace`,
    description: product.shortDescription ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const image = product.images[0];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <Link href="/productos" className="text-sm text-emerald-800">
        ← Volver al catalogo
      </Link>

      <article className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-stone-500">
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

        <div>
          {product.category ? (
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-sm uppercase tracking-[0.2em] text-emerald-800"
            >
              {product.category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
          {product.vendor ? (
            <p className="mt-2 text-stone-600">
              Productor:{" "}
              <Link
                href={`/productores/${product.vendor.slug}`}
                className="text-emerald-800 underline"
              >
                {product.vendor.tradeName}
              </Link>
            </p>
          ) : null}
          <p className="mt-6 text-3xl font-semibold text-emerald-900">
            {formatPrice(product.basePrice)}
          </p>
          {product.previousPrice ? (
            <p className="text-sm text-stone-500 line-through">
              {formatPrice(product.previousPrice)}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-stone-600">
            {product.stock > 0 ? `${product.stock} uds. disponibles` : "Agotado"}
          </p>

          {product.shortDescription ? (
            <p className="mt-6 text-stone-700">{product.shortDescription}</p>
          ) : null}

          {product.variants.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-medium">Formatos</h2>
              <ul className="mt-3 space-y-2">
                {product.variants
                  .filter((variant) => variant.isActive)
                  .map((variant) => (
                    <li
                      key={variant.id}
                      className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm"
                    >
                      <span>{variant.label}</span>
                      <span>
                        {formatPrice(variant.price)}
                        {variant.stock <= 0 ? " · agotado" : ""}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {product.longDescription ? (
          <section>
            <h2 className="text-lg font-medium">Descripcion</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.longDescription}
            </p>
          </section>
        ) : null}
        {product.ingredients ? (
          <section>
            <h2 className="text-lg font-medium">Ingredientes</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.ingredients}
            </p>
          </section>
        ) : null}
        {product.allergens ? (
          <section>
            <h2 className="text-lg font-medium">Alergenos</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.allergens}
            </p>
          </section>
        ) : null}
        {product.conservation ? (
          <section>
            <h2 className="text-lg font-medium">Conservacion</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.conservation}
            </p>
          </section>
        ) : null}
        {product.origin ? (
          <section>
            <h2 className="text-lg font-medium">Origen</h2>
            <p className="mt-3 text-stone-700">{product.origin}</p>
          </section>
        ) : null}
        {product.producerInfo ? (
          <section>
            <h2 className="text-lg font-medium">Informacion del productor</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.producerInfo}
            </p>
          </section>
        ) : null}
        {product.shippingConditions ? (
          <section>
            <h2 className="text-lg font-medium">Condiciones de envio</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.shippingConditions}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
