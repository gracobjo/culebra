import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicProductBySlug,
  getVendorByUserId,
  listAccommodationsForProduct,
} from "@culebra/auth";
import { auth } from "@/auth";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { OwnerProductToolbar } from "@/components/catalog/owner-product-toolbar";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { TrustStrip } from "@/components/ux/trust-strip";
import { JsonLd } from "@/components/ux/json-ld";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo";
import { buildPageMetadata } from "@/lib/site";
import { toPublicImageSrc } from "@/lib/product-image";
import { bookingCtaLabel, resolveBookingHref } from "@/lib/tourism";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) {
    return { title: "Producto no encontrado" };
  }
  const description =
    product.shortDescription ??
    `Compra ${product.name} de ${product.vendor?.tradeName ?? "productor local"}.`;
  return buildPageMetadata({
    title: product.name,
    description,
    path: `/productos/${slug}`,
    image: product.images[0]?.url
      ? toPublicImageSrc(product.images[0].url)
      : undefined,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const stays = await listAccommodationsForProduct(product.id, 4);

  const session = await auth();
  let isOwner = false;
  if (session?.user?.id && session.user.roles?.includes("VENDOR")) {
    try {
      const vendor = await getVendorByUserId(session.user.id);
      isOwner = Boolean(vendor && vendor.id === product.vendorId);
    } catch {
      isOwner = false;
    }
  }

  const image = product.images[0];
  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/tienda" },
    { label: "Productos", href: "/productos" },
    ...(product.category
      ? [{ label: product.category.name, href: `/categorias/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  const productJsonLd = buildProductJsonLd(product);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <PageShell width="xl">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Breadcrumbs items={breadcrumbItems} />

      {isOwner ? (
        <OwnerProductToolbar
          productId={product.id}
          productName={product.name}
          hasOwnImage={Boolean(image)}
        />
      ) : null}

      <article className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative flex aspect-square min-h-56 items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-stone-500 lg:sticky lg:top-24 lg:self-start">
          {image ? (
            <img
              src={toPublicImageSrc(image.url)}
              alt={image.altText ?? product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <span>Sin imagen</span>
              {isOwner ? (
                <Link
                  href={`/panel/proveedor/productos/${product.id}#foto`}
                  className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white"
                >
                  Subir foto
                </Link>
              ) : null}
            </div>
          )}
          {isOwner && image ? (
            <Link
              href={`/panel/proveedor/productos/${product.id}#foto`}
              className="absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm ring-1 ring-stone-200 hover:bg-white"
            >
              Cambiar foto
            </Link>
          ) : null}
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
          <h1 className="mt-2 break-words text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          {product.vendor ? (
            <p className="mt-2 text-stone-600">
              Productor:{" "}
              <Link
                href={`/productores/${product.vendor.slug}`}
                className="font-medium text-emerald-800 underline"
              >
                {product.vendor.tradeName}
              </Link>
              {product.vendor.city ? ` · ${product.vendor.city}` : ""}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-semibold text-emerald-900">
              {formatPrice(product.basePrice)}
            </p>
            {product.previousPrice ? (
              <p className="text-lg text-stone-500 line-through">
                {formatPrice(product.previousPrice)}
              </p>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {product.stock > 0 ? `${product.stock} uds. disponibles` : "Agotado temporalmente"}
            {product.unit ? ` · ${product.unit}` : ""}
          </p>

          {product.shortDescription ? (
            <p className="mt-6 text-stone-700">{product.shortDescription}</p>
          ) : null}

          {product.variants.length > 0 ? (
            <section className="mt-8">
              <h2 className="font-medium">Formatos disponibles</h2>
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

          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <AddToCartForm product={product} />
            <p className="mt-4 text-xs text-stone-500">
              Pago seguro con Stripe. Envio gestionado por el productor segun sus
              condiciones indicadas abajo.
            </p>
          </div>
        </div>
      </article>

      <section className="mt-12">
        <TrustStrip />
      </section>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {product.longDescription ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-medium">Descripcion</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">{product.longDescription}</p>
          </section>
        ) : null}
        {product.origin ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-medium">Origen</h2>
            <p className="mt-3 text-stone-700">{product.origin}</p>
          </section>
        ) : null}
        {product.ingredients ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-medium">Ingredientes</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">{product.ingredients}</p>
          </section>
        ) : null}
        {product.allergens ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-medium text-amber-950">Alergenos</h2>
            <p className="mt-3 whitespace-pre-line text-amber-950/90">{product.allergens}</p>
          </section>
        ) : null}
        {product.conservation ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-medium">Conservacion</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">{product.conservation}</p>
          </section>
        ) : null}
        {product.shippingConditions ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5">
            <h2 className="text-lg font-medium">Condiciones de envio</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {product.shippingConditions}
            </p>
          </section>
        ) : null}
        {product.producerInfo ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-5 md:col-span-2">
            <h2 className="text-lg font-medium">Sobre el productor</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">{product.producerInfo}</p>
          </section>
        ) : null}
      </div>

      {stays.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Si vienes a la sierra…</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            Alojamientos del territorio donde puedes combinar visita y compra local.
            La reserva se hace en su canal habitual.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stays.map((stay) => {
              const href = resolveBookingHref(stay);
              return (
                <article
                  key={stay.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5"
                >
                  <Link
                    href={`/alojamientos/${stay.slug}`}
                    className="text-lg font-medium hover:text-emerald-900"
                  >
                    {stay.name}
                  </Link>
                  {stay.city ? (
                    <p className="mt-1 text-sm text-stone-500">{stay.city}</p>
                  ) : null}
                  {stay.shortDescription ? (
                    <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                      {stay.shortDescription}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link href={`/alojamientos/${stay.slug}`} className="text-emerald-800 underline">
                      Ver ficha
                    </Link>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-900 underline"
                      >
                        {bookingCtaLabel(stay.bookingChannel)}
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
