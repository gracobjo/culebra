import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicTourismPackBySlug } from "@culebra/auth";
import { AddPackToCartButton } from "@/components/catalog/add-pack-to-cart-button";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { formatPrice } from "@/lib/format";
import { buildPageMetadata } from "@/lib/site";
import { bookingCtaLabel, resolveBookingHref } from "@/lib/tourism";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pack = await getPublicTourismPackBySlug(slug);
  if (!pack) return { title: "Pack no encontrado" };
  return buildPageMetadata({
    title: pack.name,
    description:
      pack.shortDescription ??
      `Pack ${pack.name}: lote gourmet${pack.accommodation ? ` + ${pack.accommodation.name}` : ""}.`,
    path: `/packs/${slug}`,
    image: pack.imageUrl ?? undefined,
  });
}

export default async function PackDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pack = await getPublicTourismPackBySlug(slug);
  if (!pack) notFound();

  const bookingHref = pack.accommodation
    ? resolveBookingHref({
        bookingUrl: pack.accommodation.bookingUrl,
        bookingChannel: pack.accommodation.bookingChannel,
      })
    : null;

  return (
    <PageShell width="xl">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda", href: "/tienda" },
          { label: "Packs", href: "/packs" },
          { label: pack.name },
        ]}
      />

      <article className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-stone-500">
          {pack.imageUrl ? (
            <img src={pack.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            "Sin imagen"
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">{pack.name}</h1>
          {pack.shortDescription ? (
            <p className="mt-4 text-stone-700">{pack.shortDescription}</p>
          ) : null}
          {pack.nightsHint ? (
            <p className="mt-3 text-sm text-stone-500">{pack.nightsHint}</p>
          ) : null}

          <p className="mt-6 text-2xl font-semibold text-emerald-900">
            Lote {formatPrice(pack.packSubtotal)}
          </p>
          {pack.couponCode ? (
            <p className="mt-2 text-sm text-emerald-800">
              Incluye cupon {pack.couponCode} al anadir al carrito (si cumple condiciones).
            </p>
          ) : null}

          <div className="mt-8">
            <AddPackToCartButton packSlug={pack.slug} />
          </div>

          {pack.accommodation ? (
            <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h2 className="font-medium">Noche en {pack.accommodation.name}</h2>
              <p className="mt-2 text-sm text-stone-600">
                La estancia se reserva fuera del marketplace.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/alojamientos/${pack.accommodation.slug}`}
                  className="text-sm text-emerald-800 underline"
                >
                  Ver alojamiento
                </Link>
                {bookingHref ? (
                  <a
                    href={bookingHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-emerald-900 underline"
                  >
                    {bookingCtaLabel(pack.accommodation.bookingChannel)}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Contenido del lote</h2>
        <ul className="mt-4 space-y-3">
          {pack.items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <Link href={`/productos/${item.slug}`} className="font-medium hover:text-emerald-900">
                  {item.name}
                </Link>
                <p className="text-sm text-stone-500">
                  {item.vendorName} · x{item.quantity}
                </p>
              </div>
              <span>{formatPrice(Number(item.basePrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>

      {pack.longDescription ? (
        <section className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold">Detalle</h2>
          <p className="mt-3 whitespace-pre-line text-stone-700">{pack.longDescription}</p>
        </section>
      ) : null}
    </PageShell>
  );
}
