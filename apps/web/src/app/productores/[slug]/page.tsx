import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVendorBySlug, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { EmptyState } from "@/components/ux/empty-state";
import { siteConfig } from "@/lib/site";

type ProducerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProducerPageProps) {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);
  if (!vendor) {
    return { title: "Productor no encontrado" };
  }
  return {
    title: `${vendor.tradeName} | ${siteConfig.shortName}`,
    description: vendor.description ?? `Productos de ${vendor.tradeName}.`,
  };
}

export default async function ProducerDetailPage({ params }: ProducerPageProps) {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const { items: products } = await listPublicProducts({
    vendorSlug: vendor.slug,
    limit: 12,
  });
  const location = [vendor.city, vendor.province].filter(Boolean).join(", ");

  return (
    <PageShell width="lg">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Productores", href: "/productores" },
          { label: vendor.tradeName },
        ]}
      />

      <header className="mt-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt=""
              className="h-24 w-24 rounded-3xl border border-stone-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-3xl font-semibold text-emerald-900">
              {vendor.tradeName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">Productor</p>
            <h1 className="mt-2 break-words text-3xl font-semibold sm:text-4xl">
              {vendor.tradeName}
            </h1>
            {location ? <p className="mt-2 text-stone-600">{location}</p> : null}
            {vendor.description ? (
              <p className="mt-4 whitespace-pre-line text-stone-700">{vendor.description}</p>
            ) : null}
          </div>
        </div>

        {vendor.history ? (
          <section className="mt-8 border-t border-stone-100 pt-8">
            <h2 className="text-lg font-medium">Historia</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">{vendor.history}</p>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 border-t border-stone-100 pt-8 sm:grid-cols-2">
          {vendor.phone ? (
            <div>
              <h3 className="text-sm font-medium text-stone-500">Telefono</h3>
              <p>{vendor.phone}</p>
            </div>
          ) : null}
          {vendor.email ? (
            <div>
              <h3 className="text-sm font-medium text-stone-500">Email</h3>
              <p>{vendor.email}</p>
            </div>
          ) : null}
          {vendor.website ? (
            <div className="sm:col-span-2">
              <h3 className="text-sm font-medium text-stone-500">Web</h3>
              <a href={vendor.website} className="break-all text-emerald-800 underline">
                {vendor.website}
              </a>
            </div>
          ) : null}
        </section>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Catalogo del productor</h2>
        {products.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Sin productos publicados"
              description="Este productor aun no tiene articulos en el catalogo."
              actionHref="/productos"
              actionLabel="Explorar otros productos"
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
