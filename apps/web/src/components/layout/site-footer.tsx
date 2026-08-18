import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
            Sierra de la Culebra
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Marketplace de productos locales. Compra directa a productores.
          </p>
        </div>
        <nav className="grid gap-2 text-sm">
          <Link href="/productos">Productos</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/productores">Productores</Link>
        </nav>
        <nav className="grid gap-2 text-sm">
          <Link href="/pedido/consultar">Consultar pedido</Link>
          <Link href="/quiero-vender">Quiero vender</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/carrito">Carrito</Link>
        </nav>
      </div>
    </footer>
  );
}
