import Link from "next/link";
import Image from "next/image";
import {
  DEFAULT_HOME_HUB_TILES,
  listHomeHubTilesForPublic,
  listPublicProducts,
  listPublicVendors,
} from "@culebra/auth";
import { ShopHubTile } from "@/components/catalog/shop-hub-tile";
import { ProductCard } from "@/components/catalog/product-card";
import { VendorCard } from "@/components/catalog/vendor-card";
import { PageShell } from "@/components/layout/page-shell";
import { TrustStrip } from "@/components/ux/trust-strip";
import { HintedLink } from "@/components/ux/hinted-link";
import { JsonLd } from "@/components/ux/json-ld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { buildPageMetadata, siteConfig } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
});

async function loadHubTiles() {
  try {
    if (typeof listHomeHubTilesForPublic !== "function") {
      return DEFAULT_HOME_HUB_TILES.map((tile, index) => ({
        id: `default-${tile.slug}`,
        ...tile,
        sortOrder: tile.sortOrder ?? (index + 1) * 10,
      }));
    }
    return await listHomeHubTilesForPublic();
  } catch {
    return DEFAULT_HOME_HUB_TILES.map((tile, index) => ({
      id: `default-${tile.slug}`,
      ...tile,
      sortOrder: tile.sortOrder ?? (index + 1) * 10,
    }));
  }
}

async function loadFeaturedProducts() {
  try {
    return await listPublicProducts({ limit: 4 });
  } catch {
    return { items: [], total: 0 };
  }
}

async function loadFeaturedVendors() {
  try {
    return await listPublicVendors({ limit: 3 });
  } catch {
    return { items: [], total: 0 };
  }
}

export default async function HomePage() {
  const [hubTiles, featuredProducts, featuredVendors] = await Promise.all([
    loadHubTiles(),
    loadFeaturedProducts(),
    loadFeaturedVendors(),
  ]);

  return (
    <PageShell className="text-stone-900">
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />

      <section className="grid min-w-0 gap-10 overflow-visible lg:grid-cols-5 lg:items-start lg:gap-12">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <p className="text-caps-label text-emerald-800 sm:text-sm">
            Escaparate de la comarca
          </p>
          <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
            Productos auténticos de la Sierra de la Culebra
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Embutidos, quesos, miel y elaboraciones de productores locales. Un solo
            envío. Confianza, territorio y comodidad.
          </p>
          <div className="btn-group">
            <HintedLink className="btn btn-primary w-full sm:w-auto" href="/tienda" hint="Entrar en la tienda de la comarca">
              Entrar en la tienda
            </HintedLink>
            <HintedLink className="btn btn-secondary w-full sm:w-auto" href="/como-funciona" hint="Ver cómo funciona la compra y el envío">
              Cómo funciona
            </HintedLink>
            <HintedLink className="btn btn-secondary w-full sm:w-auto" href="/quiero-vender" hint="Información para productores que quieren vender">
              Soy productor
            </HintedLink>
          </div>
        </div>

        <div className="min-w-0 self-start lg:col-span-2 lg:sticky lg:top-24">
          <div className="panel-shell relative overflow-hidden text-white shadow-xl">
            <div className="absolute inset-0 grid grid-cols-2 gap-0.5 opacity-50">
              {[
                "/categories/embutidos-y-productos-carnicos.png",
                "/categories/quesos-y-lacteos.png",
                "/categories/miel-y-productos-apicolas.png",
                "/categories/vinos.png",
              ].map((src) => (
                <div key={src} className="relative">
                  <Image src={src} alt="Producto local de la Sierra de la Culebra" fill className="object-cover" sizes="20vw" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f241c]/95 via-[var(--monte)]/88 to-[#0f241c]/65" />
            <div className="panel-inset relative">
              <p className="text-caps-label text-[color-mix(in_srgb,var(--accent-gold)_70%,white)]">
                Territorio
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-tight">
                Sierra de la Culebra
              </h2>
              <p className="mt-4 text-base leading-relaxed text-emerald-50/90">
                Un escaparate pensado para conectar elaboradores de Villardeciervos
                y su entorno con compradores que buscan origen, calidad y un solo
                envío.
              </p>
              <HintedLink href="/productores" hint="Ver el listado de productores locales" className="text-link-underline mt-6 text-sm text-white">
                Conocer productores
              </HintedLink>
            </div>
          </div>
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
          <HintedLink href="/tienda" hint="Ir a la tienda completa de la comarca" className="shrink-0 text-sm text-emerald-800">
            Ver tienda
          </HintedLink>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubTiles.map((tile) => (
            <ShopHubTile
              key={tile.id}
              href={tile.href}
              title={tile.title}
              description={tile.description}
              imageSrc={tile.imageUrl}
              imageAlt={tile.altText}
              hint={tile.hintText}
              tone={tile.tone}
              externalHint={tile.href.startsWith("/alojamientos")}
              eyebrow={tile.tone === "territory" ? "Territorio" : undefined}
            />
          ))}
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
