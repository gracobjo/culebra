import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="site-container grid max-w-6xl gap-8 py-10 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
            {siteConfig.shortName}
          </p>
          <p className="mt-2 max-w-md text-sm text-stone-600">{siteConfig.description}</p>
          <p className="mt-4 text-xs text-stone-500">
            Compra directa a productores · Pago seguro · Seguimiento de pedido
          </p>
        </div>
        <nav className="grid gap-2 text-sm" aria-label="Catalogo">
          <p className="font-medium text-stone-800">Explorar</p>
          <Link href="/tienda" className="text-stone-600 hover:text-emerald-800">
            Tienda
          </Link>
          <Link href="/productos" className="text-stone-600 hover:text-emerald-800">
            Productos
          </Link>
          <Link href="/productores" className="text-stone-600 hover:text-emerald-800">
            Productores
          </Link>
          <Link href="/alojamientos" className="text-stone-600 hover:text-emerald-800">
            Alojamientos
          </Link>
          <Link href="/packs" className="text-stone-600 hover:text-emerald-800">
            Packs
          </Link>
          <Link href="/como-funciona" className="text-stone-600 hover:text-emerald-800">
            Como funciona
          </Link>
        </nav>
        <nav className="grid gap-2 text-sm" aria-label="Cuenta y ayuda">
          <p className="font-medium text-stone-800">Ayuda</p>
          <Link href="/pedido/consultar" className="text-stone-600 hover:text-emerald-800">
            Consultar pedido
          </Link>
          <Link href="/quiero-vender" className="text-stone-600 hover:text-emerald-800">
            Quiero vender
          </Link>
          <Link href="/login" className="text-stone-600 hover:text-emerald-800">
            Entrar
          </Link>
          <Link href="/carrito" className="text-stone-600 hover:text-emerald-800">
            Carrito
          </Link>
        </nav>
      </div>
      <div className="site-container max-w-6xl border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        {siteConfig.region} · Textos legales en revision profesional
      </div>
    </footer>
  );
}
