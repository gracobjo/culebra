import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-[color-mix(in_srgb,var(--cream)_65%,white)]">
      <div className="site-container grid max-w-6xl gap-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href="/" className="inline-flex items-center gap-3" aria-label={siteConfig.shortName}>
            <Image
              src="/logo.png"
              alt=""
              width={64}
              height={64}
              className="h-12 w-auto"
            />
            <span className="text-sm font-semibold tracking-[0.12em] text-[var(--monte)] uppercase">
              {siteConfig.shortName}
            </span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">
            Escaparate de productos de autor de la Sierra de la Culebra. Compra a
            productores locales con un solo envío: confianza, territorio y comodidad.
          </p>
        </div>
        <nav className="grid gap-2.5 text-sm lg:col-span-3" aria-label="Explorar">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Explorar
          </p>
          <Link href="/tienda" className="text-stone-700 transition hover:text-[var(--monte)]">
            Tienda
          </Link>
          <Link href="/productos" className="text-stone-700 transition hover:text-[var(--monte)]">
            Productos
          </Link>
          <Link href="/productores" className="text-stone-700 transition hover:text-[var(--monte)]">
            Productores
          </Link>
          <Link href="/como-funciona" className="text-stone-700 transition hover:text-[var(--monte)]">
            Cómo funciona
          </Link>
        </nav>
        <nav className="grid gap-2.5 text-sm lg:col-span-4" aria-label="Ayuda">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Ayuda
          </p>
          <Link href="/quiero-vender" className="text-stone-700 transition hover:text-[var(--monte)]">
            Quiero vender
          </Link>
          <Link href="/pedido/consultar" className="text-stone-700 transition hover:text-[var(--monte)]">
            Consultar pedido
          </Link>
          <Link href="/contacto" className="text-stone-700 transition hover:text-[var(--monte)]">
            Contacto
          </Link>
          <Link href="/alojamientos" className="text-stone-700 transition hover:text-[var(--monte)]">
            Turismo rural
          </Link>
          <Link href="/packs" className="text-stone-700 transition hover:text-[var(--monte)]">
            Packs y experiencias
          </Link>
        </nav>
      </div>
      <div className="site-container max-w-6xl border-t border-stone-200/70 py-5 text-center text-xs tracking-wide text-stone-500">
        {siteConfig.region} · Textos legales en revisión profesional
      </div>
    </footer>
  );
}
