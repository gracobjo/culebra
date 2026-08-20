import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicAccommodationBySlug } from "@culebra/auth";
import { formatPrice } from "@/lib/format";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { buildPageMetadata } from "@/lib/site";
import { bookingCtaLabel, resolveBookingHref } from "@/lib/tourism";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublicAccommodationBySlug(slug);
  if (!item) return { title: "Alojamiento no encontrado" };
  return buildPageMetadata({
    title: item.name,
    description:
      item.shortDescription ??
      `Alojamiento en ${item.city ?? "la Sierra de la Culebra"}. Reserva externa y productos locales.`,
    path: `/alojamientos/${slug}`,
    image: item.imageUrl ?? undefined,
  });
}

export default async function AccommodationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublicAccommodationBySlug(slug);
  if (!item) notFound();

  const bookingHref = resolveBookingHref(item);
  const location = [item.address, item.city, item.province].filter(Boolean).join(" · ");

  return (
    <PageShell width="xl">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda", href: "/tienda" },
          { label: "Alojamientos", href: "/alojamientos" },
          { label: item.name },
        ]}
      />

      <article className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-stone-500">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            "Sin imagen"
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">{item.kind}</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{item.name}</h1>
          {location ? <p className="mt-2 text-stone-600">{location}</p> : null}
          {item.capacity ? (
            <p className="mt-1 text-sm text-stone-500">Capacidad orientativa: {item.capacity} personas</p>
          ) : null}

          {item.shortDescription ? (
            <p className="mt-6 text-stone-700">{item.shortDescription}</p>
          ) : null}

          {bookingHref ? (
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white"
            >
              {bookingCtaLabel(item.bookingChannel)}
            </a>
          ) : (
            <p className="mt-8 text-sm text-stone-600">
              Contacto: {[item.phone, item.email].filter(Boolean).join(" · ") || "consultar"}
            </p>
          )}

          <p className="mt-4 text-sm text-stone-500">
            La reserva del alojamiento se gestiona fuera del marketplace. Aqui te enlazamos con
            su canal habitual.
          </p>
        </div>
      </article>

      {item.longDescription ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-semibold">Sobre el alojamiento</h2>
          <p className="mt-3 whitespace-pre-line text-stone-700">{item.longDescription}</p>
        </section>
      ) : null}

      {item.linkedProducts.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Si te alojaste aqui, prueba estos productos</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            Sabores de la sierra para llevarte a casa o pedir a domicilio.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {item.linkedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.slug}`}
                className="rounded-3xl border border-stone-200 bg-white p-4 hover:border-emerald-300"
              >
                <p className="font-medium">{product.name}</p>
                <p className="mt-1 text-sm text-stone-500">{product.vendorName}</p>
                <p className="mt-2 text-emerald-900">{formatPrice(product.basePrice)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-10">
        <Link href="/packs" className="text-emerald-800 underline">
          Ver packs noche + lote gourmet
        </Link>
      </p>
    </PageShell>
  );
}
