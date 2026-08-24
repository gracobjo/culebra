import { getCategoryImageSrc, STOREFRONT_MOSAIC } from "@/lib/category-images";
import { toPublicImageSrc } from "@/lib/product-image";

const MIEL = "/categories/miel-y-productos-apicolas.png";
const EMBUTIDO = "/categories/embutidos-y-productos-carnicos.png";
const QUESO = "/categories/quesos-y-lacteos.png";
const DULCE = "/categories/reposteria.png";
const VINO = "/categories/vinos.png";
const LICOR = "/categories/licores.png";
const TRAD = "/categories/productos-tradicionales.png";

/** Portadas por slug cuando el pack no tiene foto propia. */
export const PACK_COVER_BY_SLUG: Record<string, string[]> = {
  "cesta-escapada": [MIEL, EMBUTIDO, QUESO],
  "cesta-comarca": [MIEL, EMBUTIDO, QUESO, DULCE],
  "cesta-sierra": [MIEL, EMBUTIDO, QUESO, VINO],
  "cesta-reserva": [VINO, QUESO, EMBUTIDO, LICOR],
  "noche-lote-gourmet-foz": [EMBUTIDO, QUESO, MIEL, TRAD],
};

type PackImageItem = {
  imageUrl?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  subcategorySlug?: string | null;
};

export function resolvePackCoverSources(pack: {
  slug: string;
  name?: string;
  imageUrl?: string | null;
  items?: PackImageItem[];
}): string[] {
  if (pack.imageUrl?.trim()) {
    return [toPublicImageSrc(pack.imageUrl)];
  }

  const uploaded = (pack.items ?? [])
    .map((item) => item.imageUrl?.trim())
    .filter((url): url is string => Boolean(url))
    .map((url) => toPublicImageSrc(url));
  if (uploaded.length > 0) return [...new Set(uploaded)].slice(0, 4);

  if (PACK_COVER_BY_SLUG[pack.slug]) return PACK_COVER_BY_SLUG[pack.slug];

  const name = pack.name?.toLowerCase() ?? "";
  if (name.includes("escapada")) return PACK_COVER_BY_SLUG["cesta-escapada"];
  if (name.includes("comarca")) return PACK_COVER_BY_SLUG["cesta-comarca"];
  if (name.includes("sierra") && name.includes("cesta")) {
    return PACK_COVER_BY_SLUG["cesta-sierra"];
  }

  const fromCategory = (pack.items ?? [])
    .filter((item) => item.categorySlug || item.subcategorySlug)
    .map((item) =>
      getCategoryImageSrc(item.subcategorySlug ?? item.categorySlug, item.categoryName),
    );
  const uniqueCategory = [...new Set(fromCategory)];
  if (uniqueCategory.length > 0) return uniqueCategory.slice(0, 4);

  return [...STOREFRONT_MOSAIC.slice(0, 4)];
}

export function resolvePackItemImage(item: PackImageItem): string {
  if (item.imageUrl?.trim()) return toPublicImageSrc(item.imageUrl);
  return getCategoryImageSrc(item.subcategorySlug ?? item.categorySlug, item.categoryName);
}
