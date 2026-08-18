import Link from "next/link";
import { listCategories, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { PageShell } from "@/components/layout/page-shell";

export default async function HomePage() {
  const categories = await listCategories();
  const { items: featuredProducts } = await listPublicProducts({ limit: 4 });

  return (
    <PageShell className="text-stone-900">
      <section className="grid gap-8 md:grid-cols-2 md:gap-10">
        <div className="space-y-5 sm:space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:text-sm sm:tracking-[0.3em]">
            Producto local, tecnologia moderna
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-6xl">
            Productos autenticos de la Sierra de la Culebra
          </h1>
          <p className="max-w-xl text-base text-stone-600 sm:text-lg">
            Descubre y compra directamente a productores de nuestro territorio
            con una experiencia de compra moderna, segura y preparada para
            crecer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
              href="/productos"
            >
              Descubrir productos
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
              href="/quiero-vender"
            >
              Soy productor
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-950 p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 sm:text-sm sm:tracking-[0.3em]">
            Fase 6
          </p>
          <h2 className="mt-4 text-xl font-semibold sm:text-2xl">Carrito y checkout</h2>
          <p className="mt-4 text-emerald-50/80">
            Compra como invitado o con cuenta. El pedido se divide por
            productor y queda pendiente de pago.
          </p>
        </div>
      </section>

      <section id="categorias" className="mt-12 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl">Categorias</h2>
          <Link href="/categorias" className="text-sm text-emerald-800">
            Ver todas
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorias/${category.slug}`}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section id="catalogo" className="mt-12 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold sm:text-2xl">Productos destacados</h2>
          <Link href="/productos" className="shrink-0 text-sm text-emerald-800">
            Ver catalogo
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <p className="mt-6 text-stone-600">
            Todavia no hay productos publicados.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
