import Link from "next/link";
import { auth } from "@/auth";
import { listCategories, listPublicProducts } from "@culebra/auth";
import { ProductCard } from "@/components/catalog/product-card";

export default async function HomePage() {
  const session = await auth();
  const categories = await listCategories();
  const { items: featuredProducts } = await listPublicProducts({ limit: 4 });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
              Sierra de la Culebra Marketplace
            </p>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/productos">Productos</Link>
            <Link href="/categorias">Categorias</Link>
            <Link href="/productores">Productores</Link>
            {session?.user ? (
              <Link href="/cuenta">Mi cuenta</Link>
            ) : (
              <>
                <Link href="/login">Entrar</Link>
                <Link href="/register">Registro</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Producto local, tecnologia moderna
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Productos autenticos de la Sierra de la Culebra
          </h1>
          <p className="max-w-xl text-lg text-stone-600">
            Descubre y compra directamente a productores de nuestro territorio
            con una experiencia de compra moderna, segura y preparada para
            crecer.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
              href="/productos"
            >
              Descubrir productos
            </Link>
            <Link
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
              href="/quiero-vender"
            >
              Soy productor
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-950 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
            Fase 5
          </p>
          <h2 className="mt-4 text-2xl font-semibold">Catalogo y productos</h2>
          <p className="mt-4 text-emerald-50/80">
            Fichas de producto, busqueda, categorias, variantes y moderacion
            antes de publicar.
          </p>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Categorias</h2>
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

      <section id="catalogo" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Productos destacados</h2>
          <Link href="/productos" className="text-sm text-emerald-800">
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
    </main>
  );
}
