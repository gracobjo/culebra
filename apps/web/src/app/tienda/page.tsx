import Link from "next/link";
import { listCategories } from "@culebra/auth";
import { ShopHubTile } from "@/components/catalog/shop-hub-tile";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
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

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
        Catalogo
      </p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Tienda de la comarca</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        El nucleo es agroalimentario: categorias con stock, variantes y compra en el
        marketplace. Turismo rural y packs se abren aparte: la noche se reserva en el
        canal del alojamiento; el lote gourmet si entra en el carrito.
      </p>

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
            description="Alojamientos y casas de la sierra. Enlace a su reserva (web, Booking o WhatsApp)."
            externalHint
          />
          <ShopHubTile
            href="/packs"
            eyebrow="Fase 3"
            title="Packs y experiencias"
            description="Noche + lote gourmet: reservas la estancia fuera; el lote se compra aqui."
          />
        </div>
      </section>
    </PageShell>
  );
}
