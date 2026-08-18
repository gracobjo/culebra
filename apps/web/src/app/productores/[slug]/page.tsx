import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVendorBySlug, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";

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
    title: `${vendor.tradeName} | Sierra de la Culebra Marketplace`,
    description: vendor.description ?? undefined,
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

  return (
    <PageShell width="lg">
      <Link href="/productores" className="text-sm text-emerald-800">
        ← Volver a productores
      </Link>

      <article className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
          Productor
        </p>
        <h1 className="mt-2 break-words text-3xl font-semibold sm:text-4xl">{vendor.tradeName}</h1>
        <p className="mt-2 text-stone-600">
          {[vendor.city, vendor.province].filter(Boolean).join(", ")}
        </p>

        {vendor.description ? (
          <section className="mt-8">
            <h2 className="text-lg font-medium">Sobre el productor</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {vendor.description}
            </p>
          </section>
        ) : null}

        {vendor.history ? (
          <section className="mt-8">
            <h2 className="text-lg font-medium">Historia</h2>
            <p className="mt-3 whitespace-pre-line text-stone-700">
              {vendor.history}
            </p>
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
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
            <div>
              <h3 className="text-sm font-medium text-stone-500">Web</h3>
              <a href={vendor.website} className="break-all text-emerald-800 underline">
                {vendor.website}
              </a>
            </div>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-medium">Productos</h2>
          {products.length === 0 ? (
            <p className="mt-2 text-stone-600">
              Este productor todavia no tiene productos publicados.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </article>
    </PageShell>
  );
}
