/** Placeholders de categoría en `/public/categories/` (catálogo y paneles). */
export const CATEGORY_PLACEHOLDER: Record<string, string> = {
  "embutidos-y-productos-carnicos": "/categories/embutidos-y-productos-carnicos.png",
  jamon: "/categories/embutidos-y-productos-carnicos.png",
  chorizo: "/categories/embutidos-y-productos-carnicos.png",
  salchichon: "/categories/embutidos-y-productos-carnicos.png",
  "otros-embutidos": "/categories/embutidos-y-productos-carnicos.png",
  "productos-derivados-del-cerdo": "/categories/embutidos-y-productos-carnicos.png",
  "loncheados-y-tacos": "/categories/embutidos-y-productos-carnicos.png",
  "quesos-y-lacteos": "/categories/quesos-y-lacteos.png",
  "queso-de-oveja": "/categories/quesos-y-lacteos.png",
  "queso-de-cabra": "/categories/quesos-y-lacteos.png",
  "queso-de-vaca": "/categories/quesos-y-lacteos.png",
  "otros-productos-lacteos": "/categories/quesos-y-lacteos.png",
  "miel-y-productos-apicolas": "/categories/miel-y-productos-apicolas.png",
  miel: "/categories/miel-y-productos-apicolas.png",
  polen: "/categories/miel-y-productos-apicolas.png",
  "jalea-real": "/categories/miel-y-productos-apicolas.png",
  "otros-productos-apicolas": "/categories/miel-y-productos-apicolas.png",
  vinos: "/categories/vinos.png",
  "vinos-tintos": "/categories/vinos.png",
  "vinos-blancos": "/categories/vinos.png",
  "vinos-rosados": "/categories/vinos.png",
  "vinos-otros": "/categories/vinos.png",
  licores: "/categories/licores.png",
  orujo: "/categories/licores.png",
  "licores-tradicionales": "/categories/licores.png",
  "productos-tradicionales": "/categories/productos-tradicionales.png",
  "dulces-secos-la-raya": "/categories/reposteria.png",
  "magdalenas-y-bizcochos": "/categories/reposteria.png",
  "harinas-y-castana": "/categories/productos-tradicionales.png",
  "mermeladas-y-confituras": "/categories/productos-tradicionales.png",
  "legumbres-y-conservas": "/categories/productos-tradicionales.png",
  reposteria: "/categories/reposteria.png",
};

const FALLBACK = "/categories/productos-tradicionales.png";

export function getCategoryImageSrc(slug?: string | null, name?: string | null): string {
  if (name?.toLowerCase().includes("repost")) {
    return "/categories/reposteria.png";
  }
  if (slug && CATEGORY_PLACEHOLDER[slug]) {
    return CATEGORY_PLACEHOLDER[slug];
  }
  return FALLBACK;
}

/** Mosaic for admin / tienda atmosphere (orden estable). */
export const STOREFRONT_MOSAIC = [
  "/categories/embutidos-y-productos-carnicos.png",
  "/categories/quesos-y-lacteos.png",
  "/categories/miel-y-productos-apicolas.png",
  "/categories/vinos.png",
  "/categories/licores.png",
  "/categories/reposteria.png",
] as const;
