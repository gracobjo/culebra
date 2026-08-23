import Link from "next/link";
import Image from "next/image";
import { listCategories } from "@culebra/auth";
import { ShopHubTile } from "@/components/catalog/shop-hub-tile";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { getCategoryImageSrc, STOREFRONT_MOSAIC } from "@/lib/category-images";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Tienda de la comarca",
  description:
    "Catalogo agroalimentario de la Sierra de la Culebra, con acceso a alojamientos y packs sin mezclar la reserva en el checkout.",
  path: "/tienda",
});

/** Textos amigables cuando la categoria no tiene description en BD. */
const CATEGORY_BLURBS: Record<string, string> = {
  "embutidos-y-productos-carnicos": "Ternera, iberico y curados de la comarca.",
  "quesos-y-lacteos": "Oveja, cabra y mezcla.",
  vinos: "Tintos, blancos y rosados del entorno.",
  licores: "Orujos y licores tradicionales. Verificacion de edad en el checkout.",
  "miel-y-productos-apicolas": "Miel de brezo, polen y elaboraciones apicolas.",
  reposteria: "Tartas, postres y dulces locales.",
  "productos-tradicionales": "Elaboraciones tipicas del territorio.",
};

export default async function TiendaPage() {
  const categories = await listCategories();

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Tienda" }]} />

      <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-emerald-950 text-white shadow-lg">
        <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-40 sm:grid-cols-6">
          {STOREFRONT_MOSAIC.map((src) => (
            <div key={src} className="relative min-h-[7rem] sm:min-h-full">
              <Image src={src} alt="" fill className="object-cover" sizes="20vw" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/92 to-emerald-950/55" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Escaparate de la comarca
          </p>
          <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Tienda de la Sierra de la Culebra
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-50/90">
            Embutidos, quesos, miel, vinos y elaboraciones de productores locales.
            Elige categoría, llena la cesta y recibe un solo envío.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
          Agroalimentario
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <ShopHubTile
              key={category.id}
              href={`/categorias/${category.slug}`}
              title={category.name}
              imageSrc={getCategoryImageSrc(category.slug, category.name)}
              description={
                category.description?.trim() ||
                CATEGORY_BLURBS[category.slug] ||
                "Productos locales de esta categoria."
              }
            />
          ))}
        </div>
        <p className="mt-4">
          <Link href="/productos" className="text-sm text-emerald-800 underline">
            Ver todos los productos
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-stone-500">
          Territorio (fuera del checkout agro)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ShopHubTile
            href="/alojamientos"
            eyebrow="Fase 2"
            title="Turismo rural"
            imageSrc="/categories/productos-tradicionales.png"
            description="Alojamientos y casas de la sierra. Enlace a su reserva (web, Booking o WhatsApp)."
            externalHint
          />
          <ShopHubTile
            href="/packs"
            eyebrow="Fase 3"
            title="Packs y experiencias"
            imageSrc="/categories/miel-y-productos-apicolas.png"
            description="Noche + lote gourmet: reservas la estancia fuera; el lote se compra aqui."
          />
        </div>
      </section>
    </PageShell>
  );
}
