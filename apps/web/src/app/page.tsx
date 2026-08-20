import Link from "next/link";
import { listCategories, listPublicProducts, listPublicVendors } from "@culebra/auth";
import { CategoryCard } from "@/components/catalog/category-card";
import { ProductCard } from "@/components/catalog/product-card";
import { VendorCard } from "@/components/catalog/vendor-card";
import { PageShell } from "@/components/layout/page-shell";
import { TrustStrip } from "@/components/ux/trust-strip";
import { JsonLd } from "@/components/ux/json-ld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { buildPageMetadata, siteConfig } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
});

export default async function HomePage() {
  const [categories, featuredProducts, featuredVendors] = await Promise.all([
    listCategories(),
    listPublicProducts({ limit: 4 }),
    listPublicVendors({ limit: 3 }),
  ]);

  return (
    <PageShell className="text-stone-900">
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />

      <section className="grid min-w-0 gap-10 lg:grid-cols-5 lg:items-start lg:gap-12">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm">
            Del territorio a tu mesa
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Productos autenticos de la Sierra de la Culebra
          </h1>
          <p className="max-w-xl text-base text-stone-600 sm:text-lg">
            Embutidos, quesos, vinos, miel y elaboraciones tradicionales. Compra
            directamente a productores locales con pago seguro y seguimiento del
            pedido.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className="btn btn-primary w-full sm:w-auto" href="/tienda">
              Entrar en la tienda
            </Link>
            <Link className="btn btn-secondary w-full sm:w-auto" href="/como-funciona">
              Como funciona
            </Link>
            <Link className="btn btn-secondary w-full sm:w-auto" href="/quiero-vender">
              Soy productor
            </Link>
          </div>
        </div>

        <div className="min-w-0 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8 lg:col-span-2 lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Territorio</p>
          <h2 className="mt-3 text-2xl font-semibold">Sierra de la Culebra</h2>
          <p className="mt-4 text-emerald-50/90">
            Un marketplace pensado para conectar elaboradores de Villardeciervos
            y su entorno con compradores que valoran el origen y la calidad.
          </p>
          <Link href="/productores" className="mt-6 inline-block text-sm underline">
            Conocer productores
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <TrustStrip compact />
      </section>

      <section id="categorias" className="mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Tienda de la comarca</h2>
            <p className="mt-1 text-sm text-stone-600">
              Agroalimentario, alojamientos y packs (checkout separado)
            </p>
          </div>
          <Link href="/tienda" className="shrink-0 text-sm text-emerald-800">
            Ver tienda
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
          <Link
            href="/alojamientos"
            className="group flex min-w-0 flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold leading-snug group-hover:text-emerald-900">
              Turismo rural
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-stone-600">
              Alojamientos de la sierra. Reserva en su canal habitual.
            </p>
          </Link>
          <Link
            href="/packs"
            className="group flex min-w-0 flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold leading-snug group-hover:text-emerald-900">
              Packs
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-stone-600">
              Noche + lote gourmet. La estancia fuera; el lote en el carrito.
            </p>
          </Link>
        </div>
      </section>

      <section id="catalogo" className="mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Productos destacados</h2>
            <p className="mt-1 text-sm text-stone-600">Seleccion reciente del catalogo</p>
          </div>
          <Link href="/productos" className="shrink-0 text-sm text-emerald-800">
            Ver catalogo
          </Link>
        </div>
        {featuredProducts.items.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-stone-300 p-8 text-center text-stone-600">
            Todavia no hay productos publicados. Vuelve pronto o{" "}
            <Link href="/quiero-vender" className="text-emerald-800 underline">
              date de alta como productor
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {featuredVendors.items.length > 0 ? (
        <section className="mt-14 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">Productores</h2>
              <p className="mt-1 text-sm text-stone-600">Conoce quien elabora cada producto</p>
            </div>
            <Link href="/productores" className="shrink-0 text-sm text-emerald-800">
              Ver todos
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVendors.items.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-3xl border border-stone-200 bg-white p-6 sm:mt-16 sm:p-8">
        <h2 className="text-xl font-semibold">Comprar en tres pasos</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Explora", text: "Filtra por categoria, precio o productor." },
            { step: "2", title: "Paga seguro", text: "Checkout como invitado o con cuenta. Pago con Stripe." },
            { step: "3", title: "Recibe", text: "Cada productor prepara y envia su parte del pedido." },
          ].map((item) => (
            <li key={item.step} className="rounded-2xl bg-stone-50 p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-sm font-medium text-white">
                {item.step}
              </span>
              <p className="mt-3 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-stone-600">{item.text}</p>
            </li>
          ))}
        </ol>
        <Link href="/como-funciona" className="mt-6 inline-block text-sm text-emerald-800 underline">
          Mas detalles sobre compra y envios
        </Link>
      </section>
    </PageShell>
  );
}
