const featuredCategories = [
  "Embutidos y productos carnicos",
  "Quesos y lacteos",
  "Vinos",
  "Miel y productos apicolas",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-800">
              Sierra de la Culebra Marketplace
            </p>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#categorias">Categorias</a>
            <a href="#productores">Productores</a>
            <a href="#como-funciona">Como funciona</a>
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
            <a
              className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-medium text-white"
              href="#catalogo"
            >
              Descubrir productos
            </a>
            <a
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium"
              href="#productores"
            >
              Soy productor
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-950 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
            Fase 1
          </p>
          <h2 className="mt-4 text-2xl font-semibold">
            Base del marketplace preparada
          </h2>
          <p className="mt-4 text-emerald-50/80">
            Esta primera iteracion deja listo el esqueleto para frontend,
            backend, documentacion y siguientes modulos del MVP.
          </p>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-2xl font-semibold">Categorias iniciales</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <article
              key={category}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-medium">{category}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
