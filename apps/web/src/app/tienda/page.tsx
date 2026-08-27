import Link from "next/link";
import Image from "next/image";
import { listCategories } from "@culebra/auth";
import { ShopHubTile } from "@/components/catalog/shop-hub-tile";
import { PageShell } from "@/components/layout/page-shell";
import { Breadcrumbs } from "@/components/ux/breadcrumbs";
import { getCategoryImageSrc, STOREFRONT_MOSAIC } from "@/lib/category-images";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Tienda de la Sierra de la Culebra",
  description:
    "Escaparate gourmet de embutidos, quesos, miel y elaboraciones de productores locales. Un solo envío.",
  path: "/tienda",
});

const CATEGORY_BLURBS: Record<string, string> = {
  "embutidos-y-productos-carnicos":
    "Pieza, loncheados de caza y tacos gourmet. Sin frío; rotación según consumo preferente.",
  "quesos-y-lacteos": "Oveja, cabra y mezcla de obradores cercanos.",
  vinos: "Tintos, blancos y rosados del entorno.",
  licores: "Orujos y licores de tradición. Edad verificada en el checkout.",
  "miel-y-productos-apicolas": "Miel de brezo, polen y elaboraciones apícolas.",
  reposteria:
    "Soles de Aliste, rosquillas de Ramos y magdalenas de Sanabria. Dulces secos sin nevera.",
  "productos-tradicionales":
    "Harina de castaña, mermeladas bajas en azúcar, legumbres y conservas de La Raya.",
};

export default async function TiendaPage() {
  const categories = await listCategories();

  return (
    <PageShell className="!pt-6 sm:!pt-8">
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Tienda" }]} />

      <section className="relative mt-5 overflow-hidden rounded-[1.75rem] text-white shadow-[var(--shadow-soft)] sm:mt-7 sm:rounded-[2rem]">
        <div className="absolute inset-0 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {STOREFRONT_MOSAIC.map((src) => (
            <div key={src} className="relative min-h-[14rem] sm:min-h-[18rem] lg:min-h-[22rem]">
              <Image
                src={src}
                alt="Producto local de la Sierra de la Culebra"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 20vw"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,36,28,0.92)_0%,rgba(27,67,50,0.78)_48%,rgba(15,36,28,0.55)_100%)]" />
        <div className="relative flex min-h-[14rem] flex-col justify-end px-6 py-10 sm:min-h-[18rem] sm:px-10 sm:py-14 lg:min-h-[22rem] lg:px-14 lg:py-16">
          <p className="text-caps-label text-[color-mix(in_srgb,var(--accent-gold)_75%,white)]">
            Escaparate de la comarca
          </p>
          <h1 className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Tienda de la Sierra de la Culebra
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
            Embutidos, quesos, miel y elaboraciones de productores locales. Un solo
            envío.
          </p>
          <div className="mt-8">
            <Link
              href="/productos"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium tracking-wide text-[var(--monte)] shadow-[0_12px_30px_-16px_rgb(0_0_0/0.45)] transition hover:bg-emerald-50"
            >
              Explorar productos
            </Link>
          </div>
          <p className="mt-6 max-w-lg text-xs tracking-[0.04em] text-emerald-100/70">
            Confianza · territorio · comodidad
          </p>
        </div>
      </section>

      <section className="mt-14 sm:mt-16">
        <h2 className="text-caps-label text-stone-500">Agroalimentario</h2>
        <p className="mt-2 max-w-xl text-sm text-stone-600">
          Categorías con stock y compra en el marketplace. Productos de autor, sin
          ruido de supermercado.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <ShopHubTile
              key={category.id}
              href={`/categorias/${category.slug}`}
              title={category.name}
              imageSrc={getCategoryImageSrc(category.slug, category.name)}
              imageAlt={`Productos de ${category.name} de la Sierra de la Culebra`}
              hint={`Abrir la categoría ${category.name}`}
              description={
                category.description?.trim() ||
                CATEGORY_BLURBS[category.slug] ||
                "Productos locales de esta categoría."
              }
            />
          ))}
        </div>
        <p className="mt-6">
          <Link
            href="/productos"
            className="text-sm font-medium text-[var(--monte)] underline decoration-[color-mix(in_srgb,var(--monte)_25%,transparent)] underline-offset-4 transition hover:decoration-[var(--monte)]"
          >
            Ver todos los productos
          </Link>
        </p>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="text-caps-label text-stone-500">Territorio</h2>
        <p className="mt-2 max-w-xl text-sm text-stone-600">
          Experiencias de la sierra, fuera del checkout agroalimentario.
        </p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ShopHubTile
            href="/alojamientos"
            tone="territory"
            eyebrow="Sin checkout"
            title="Turismo rural"
            imageSrc="/categories/productos-tradicionales.png"
            imageAlt="Productos de la sierra que ilustran el territorio y los alojamientos rurales"
            hint="Ver alojamientos rurales. La reserva se hace fuera del marketplace"
            description="Alojamientos y casas de la sierra. Reserva en su canal habitual."
            externalHint
          />
          <ShopHubTile
            href="/packs"
            tone="territory"
            eyebrow="Lote gourmet"
            title="Packs y cestas"
            imageSrc="/categories/miel-y-productos-apicolas.png"
            imageAlt="Miel y elaboraciones locales de las cestas y packs gourmet"
            hint="Ver packs y cestas gourmet"
            description="Cestas del showroom y noche + lote. El envío, si aplica: tarifa plana a cargo del cliente."
          />
        </div>
      </section>
    </PageShell>
  );
}
